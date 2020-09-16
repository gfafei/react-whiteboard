import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import './iconfont.css';
import Line from './tools/line';
import Eraser from './tools/eraser';
import clsx from 'clsx';
import io from 'socket.io-client';

const initialState = {
  boardName: 'anonymous',
  color: '#f00056',
  size: 5,
  points: [],
  toolDic: {},
  elements: new Map(),
  //主画布
  mainContext: null,
  //正在绘制的画布
  drawingContext: null,
  //选择命中区域的画布
  hitRegionContext: null,
  socket: null
}
const canvasStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
}

const App = () => {
  const canvasRef = useRef(null)
  const mainLayerRef = useRef(null)
  const stateRef = useRef(initialState);
  const state = stateRef.current;
  const [curTool, setTool] = useState(null);

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
    state.mainContext = mainLayerRef.current.getContext('2d');
    state.drawingContext =  canvasRef.current.getContext('2d');

    const ctx = state.drawingContext;
    const mainCtx = state.mainContext;
    ctx.lineJoin = mainCtx.strokeStyle = 'round';
    ctx.lineCap = mainCtx.lineCap = 'round';

    const hitRegion = document.createElement('canvas')
    hitRegion.width = ctx.canvas.width;
    hitRegion.height = ctx.canvas.height;
    const hitRegionCtx = hitRegion.getContext('2d');
    hitRegionCtx.lineWidth = state.size;
    hitRegionCtx.lineCap = 'round';
    hitRegionCtx.lineJoin = 'round';
    state.hitRegionContext = hitRegionCtx;

    state.toolDic['Pencil'] = new Line(state);
    state.toolDic['Eraser'] = new Eraser(state);

    setTool('Pencil');

    const socket = io('localhost:8080');
    socket.emit('getboard', state.boardName);
    socket.on('broadcast', (msg) => {
      console.log(msg)
      msg._children.forEach(child => {
        const tool = state.toolDic[child.tool];
        if (tool) {
          tool.draw(child)
        }
      })
    })
    socket.on('reconnect', () => {
      console.log('reconnect')
    })
    state.socket = socket;

  }, []);

  useEffect(() => {
    const { toolDic } = state;
    if (!curTool) return;
    const tool = toolDic[curTool];
    canvasRef.current.style.cursor = tool.cursor;
  }, [curTool])

  const handleMouseDown = (e) => {
    const { toolDic } = state;
    const tool = toolDic[curTool];
    if (!tool) {
      throw Error(`tool ${curTool} does not exist`)
    }
    tool.handleMouseDown(e)
  }
  const handleMouseMove = (e) => {
    const { toolDic } = state;
    if (!curTool) return;
    const tool = toolDic[curTool];
    if (!tool) {
      throw Error(`tool ${curTool} does not exist`)
    }
    tool.handleMouseMove(e);
  }

  const handleMouseUp = (e) => {
    const { toolDic } = state;
    const tool = toolDic[curTool];
    if (!tool) {
      throw Error(`tool ${curTool} does not exist`)
    }
    tool.handleMouseUp(e)
  }

  return (
    <div className="whiteboard">
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
      <canvas
        ref={mainLayerRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />
      <div className="menu-wrapper" style={{ width: 110 }}>
        {
          Object.values(state.toolDic).map(tool => (
            <div key={tool.name} className={clsx('menu-item', { active: curTool === tool.name })}
                 onClick={() => setTool(tool.name)}
            >
              <i className={clsx('icon', tool.icon)}/>
              <span className="tool-name">{tool.label}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default App;
