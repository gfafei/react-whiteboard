import React, { useEffect, useRef } from 'react';
import './App.css';
import './iconfont.css';
import Pencil from './tools/pencil';
import Eraser from './tools/eraser';
import Rect from './tools/rect';
import Clear from './tools/clear';
import io from 'socket.io-client';
import Format from './tools/format'
import {fillBackground, isMobile} from './utils';

const initialState = {
  scale: 1,
  background: '#ffffff',
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

const getScale = ({
  width,
  height,
  canvasWidth,
  canvasHeight
}) => {
  const scaleX = width / canvasWidth;
  const scaleY = height / canvasHeight;
  return Math.min(scaleX, scaleY);
}
const App = React.forwardRef((props, ref) => {
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
    if (ref) {
      ref.current = mainLayerRef.current;
    }
    const mainCtx = state.context;

    state.scale = getScale(props);
    mainCtx.canvas.height = props.canvasHeight * state.scale;
    mainCtx.canvas.width = props.canvasWidth * state.scale;
    mainCtx.scale(state.scale, state.scale);

    fillBackground(mainCtx, state.background);

    const hitRegion = document.createElement('canvas')
    hitRegion.width = mainCtx.canvas.width;
    hitRegion.height = mainCtx.canvas.height;
    state.hitRegionContext = hitRegion.getContext('2d');


    state.toolDic['Pencil'] = new Pencil(state);
    state.toolDic['Eraser'] = new Eraser(state);
    state.toolDic['Format'] = new Format(state);
    if (!isMobile()) {
      state.toolDic['Rect'] = new Rect(state);
    }
    state.toolDic['Clear'] = new Clear(state);

    state.curTool = 'Pencil';
    mainLayerRef.current.style.cursor = state.toolDic[state.curTool].cursor;
    state.forceUpdate = forceUpdate;
    state.canvas = mainLayerRef.current;
    forceUpdate();

    //TODO for debug
    window.elements = state.elements

    const socket = io('http://localhost:8080');
    state.boardName = props.name;
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

    return () => {
      state.toolDic['Format'].onUnmount();
    }
  }, []);
  React.useEffect(() => {
    if (!isMobile()) return;
    const resizeHandler = () => {
      state.scale = getScale({
        width: window.innerWidth,
        height: window.innerHeight,
        canvasWidth: props.canvasWidth,
        canvasHeight: props.canvasHeight
      })
      mainLayerRef.current.height = props.canvasHeight * state.scale;
      mainLayerRef.current.width = props.canvasWidth * state.scale;
      state.context.scale(state.scale, state.scale);
      state.toolDic['Pencil'].refresh();
    }
    window.addEventListener('resize', resizeHandler)
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])
  React.useEffect(() => {
    state.scale = getScale(props);
    mainLayerRef.current.height = props.canvasHeight * state.scale;
    mainLayerRef.current.width = props.canvasWidth * state.scale;
    state.context.scale(state.scale, state.scale);
    state.toolDic['Pencil'].refresh();
  }, [props.width, props.height]);

  const getPos = (e, scale) => {
    const rect = mainLayerRef.current.getBoundingClientRect();
    return [
      (e.pageX - rect.left) / scale,
      (e.pageY - rect.top) / scale
    ]
  }
  const handleMouseDown = (e) => {
    const { toolDic, curTool } = state;
    const tool = toolDic[curTool];
    if (!tool) {
      throw Error(`tool ${curTool} does not exist`);
    }
    state.mousePressed = true;
    tool.handleMouseDown(e, ...getPos(e, state.scale));
  }
  const handleTouchStart = (e) => {
    const { toolDic, curTool } = state;
    const tool = toolDic[curTool];
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      state.mousePressed = true;
      tool.handleMouseDown(e, ...getPos(touch, state.scale));
    }
  }
  const handleTouchMove = (e) => {
    const { toolDic, curTool } = state;
    const tool = toolDic[curTool];
    if (!tool) throw Error(`tool ${curTool} does not exist`);
    if (e.changedTouches.length !== 1) return;
    if (!state.mousePressed) return;
    const touch = e.changedTouches[0];
    tool.handleMouseMove(e, ...getPos(touch, state.scale));
  }
  const handleTouchLeave = (e) => {
    const { toolDic, curTool } = state;
    const tool = toolDic[curTool];
    if (!tool) throw Error(`tool ${curTool} does not exist`);
    if (e.changedTouches.length !== 1) return;
    state.mousePressed = false;
    const touch = e.changedTouches[0];
    tool.handleMouseUp(e, ...getPos(touch, state.scale));
  }

  const handleMouseMove = (e) => {
    if (!state.mousePressed) return;
    const { toolDic, curTool } = state;
    const tool = toolDic[curTool];
    if (!tool) {
      throw Error(`tool ${curTool} does not exist`)
    }
    tool.handleMouseMove(e, ...getPos(e, state.scale));
  }

  const handleMouseUp = (e) => {
    if (!state.mousePressed) return;
    const { toolDic, curTool } = state;
    const tool = toolDic[curTool];
    if (!tool) {
      throw Error(`tool ${curTool} does not exist`)
    }
    state.mousePressed = false;
    tool.handleMouseUp(e, ...getPos(e, state.scale))
  }
  return (
    <div className="whiteboard" style={{ width: props.width, height: props.height }}>
      <canvas
        ref={mainLayerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchLeave}
        onTouchCancel={handleTouchLeave}
      />
      <div className="menu-wrapper">
        {
          Object.values(state.toolDic).map(tool => tool.renderNode())
        }
      </div>
    </div>
  )
})

App.defaultProps = {
  name: 'anonymous',
  canvasWidth: 1600,
  canvasHeight: 900,
  width: window.innerWidth,
  height: window.innerHeight
}
export default App;
