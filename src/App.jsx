import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import './iconfont.css';
import Pencil from './tools/pencil';
import Eraser from './tools/eraser';
import Rect from './tools/rect';
import Clear from './tools/clear';
import io from 'socket.io-client';
import Format from './tools/format'

const initialState = {
  boardName: 'anonymous',
  color: '#FE0000',
  size: 5,
  points: [],
  toolDic: {},
  elements: new Map(),
  mousePressed: false,
  //主画布
  context: null,
  //选择命中区域的画布
  hitRegionContext: null,
  socket: null,
  curTool: null
}

const useForceUpdate = () => {
  const [, dispatch] = React.useState(Object.create(null))
  return () => {
    dispatch(Object.create(null))
  }
}

const App = () => {
  const mainLayerRef = useRef(null)
  const stateRef = useRef(initialState);
  const state = stateRef.current;
  const forceUpdate = useForceUpdate();

  const drawElement = (ele) => {
    const tool = state.toolDic[ele.tool];
    if (!tool) {
      throw Error(`tool ${tool} does not exist`)
    }
    tool.draw(ele);
  }

  const handleMessage = (msg) => {
    if (!msg.tool && !msg._children) {
      console.error('Received a badly formatted message', msg)
    }
    if (msg.tool) {
      drawElement(msg);
    }
    if (msg._children) {
      msg._children.forEach(handleMessage)
    }
  }

  useEffect(() => {
    state.context = mainLayerRef.current.getContext('2d');

    const mainCtx = state.context;
    mainCtx.lineCap = 'round';
    mainCtx.lineJoin = 'round';

    const hitRegion = document.createElement('canvas')
    hitRegion.width = mainCtx.canvas.width;
    hitRegion.height = mainCtx.canvas.height;
    const hitRegionCtx = hitRegion.getContext('2d');
    hitRegionCtx.lineWidth = state.size;
    hitRegionCtx.lineCap = 'round';
    hitRegionCtx.lineJoin = 'round';
    state.hitRegionContext = hitRegionCtx;

    state.toolDic['Pencil'] = new Pencil(state);
    state.toolDic['Eraser'] = new Eraser(state);
    state.toolDic['Rect'] = new Rect(state);
    state.toolDic['Clear'] = new Clear(state);
    state.toolDic['Format'] = new Format(state);

    state.curTool = 'Pencil';
    mainLayerRef.current.style.cursor = state.toolDic[state.curTool].cursor;
    state.forceUpdate = forceUpdate;
    state.canvas = mainLayerRef.current;
    forceUpdate();

    //TODO for debug
    window.elements = state.elements

    const socket = io('http://localhost:8080');
    socket.emit('getBoard', state.boardName);
    socket.on('broadcast', (msg) => {
      if (msg.elements) {
        Object.values(msg.elements).forEach(element => {
          const tool = state.toolDic[element.tool];
          if (tool) {
            tool.draw(element)
          }
        })
      } else {
        const tool = state.toolDic[msg.tool];
        if (tool) {
          tool.draw(msg)
        }
      }
    })
    socket.on('reconnect', () => {
      console.log('reconnect')
    })
    state.socket = socket;

  }, []);

  const handleMouseDown = (e) => {
    const { toolDic, curTool } = state;
    const tool = toolDic[curTool];
    if (!tool) {
      throw Error(`tool ${curTool} does not exist`);
    }
    state.mousePressed = true;
    tool.handleMouseDown(e);
  }
  const handleMouseMove = (e) => {
    if (!state.mousePressed) return;
    const { toolDic, curTool } = state;
    const tool = toolDic[curTool];
    if (!tool) {
      throw Error(`tool ${curTool} does not exist`)
    }
    tool.handleMouseMove(e);
  }

  const handleMouseUp = (e) => {
    if (!state.mousePressed) return;
    const { toolDic, curTool } = state;
    const tool = toolDic[curTool];
    if (!tool) {
      throw Error(`tool ${curTool} does not exist`)
    }
    state.mousePressed = false;
    tool.handleMouseUp(e)
  }
  return (
    <div className="whiteboard">
      <canvas
        ref={mainLayerRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <div className="menu-wrapper">
        {
          Object.values(state.toolDic).map(tool => tool.renderNode())
        }
      </div>
    </div>
  )
}

export default App;
