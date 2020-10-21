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
import Undo from "./tools/undo";
import Redo from "./tools/redo";

const initialState = {
  scale: 1,
  background: '#ffffff',
  color: '#FE0000',
  size: 5,
  points: [],
  toolDic: {},
  elements: new Map(),
  store: new Map(),
  undoStack: [],
  redoStack: [],
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

const getScale = (size, {
  canvasWidth,
  canvasHeight
}) => {
  const scaleX = size.width / canvasWidth;
  const scaleY = size.height / canvasHeight;
  return Math.min(scaleX, scaleY);
}
const App = React.forwardRef((props, ref) => {
  const mainLayerRef = useRef(null)
  const stateRef = useRef(initialState);
  const state = stateRef.current;
  const forceUpdate = useForceUpdate();
  const [size, setSize] = React.useState({
    width: props.width || window.innerWidth,
    height: props.height || window.innerHeight
  })

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

  const resetScale = () => {
    state.context.canvas.height = props.canvasHeight * state.scale;
    state.context.canvas.width = props.canvasWidth * state.scale;
    state.context.scale(state.scale, state.scale);

    state.hitRegionContext.canvas.height = props.canvasHeight * state.scale;
    state.hitRegionContext.canvas.width = props.canvasWidth * state.scale;
    state.hitRegionContext.scale(state.scale, state.scale);
  }

  useEffect(() => {
    state.context = mainLayerRef.current.getContext('2d');
    if (ref) {
      ref.current = mainLayerRef.current;
    }
    const mainCtx = state.context;
    state.scale = getScale(size, props);
    fillBackground(mainCtx, state.background);

    const hitRegion = document.createElement('canvas')
    state.hitRegionContext = hitRegion.getContext('2d');
    resetScale();

    state.toolDic['Pencil'] = new Pencil(state);
    state.toolDic['Eraser'] = new Eraser(state);
    state.toolDic['Format'] = new Format(state);
    if (!isMobile()) {
      state.toolDic['Rect'] = new Rect(state);
    }
    state.toolDic['Undo'] = new Undo(state);
    state.toolDic['Redo'] = new Redo(state);
    state.toolDic['Clear'] = new Clear(state);

    state.curTool = 'Pencil';
    mainLayerRef.current.style.cursor = state.toolDic[state.curTool].cursor;
    state.forceUpdate = forceUpdate;
    state.canvas = mainLayerRef.current;
    forceUpdate();

    //TODO for debug
    window.elements = state.elements
    window.state = state;
    const socket = io(':8080');
    state.boardName = props.name;
    socket.emit('getBoard', state.boardName);
    socket.on('broadcast', (msg) => {
      if (msg.elements) {
        Object.values(msg.elements).forEach(element => {
          const tool = state.toolDic[element.tool];
          if (tool) {
            tool.draw(element)
            state.toolDic['Pencil'].cacheMessage(element);
          }
        })
      } else {
        const tool = state.toolDic[msg.tool];
        if (tool) {
          tool.draw(msg)
          state.toolDic['Pencil'].cacheMessage(msg);
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
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
      state.scale = getScale(size, props)
      resetScale();
      state.toolDic['Pencil'].refresh();
    }
    window.addEventListener('resize', resizeHandler)
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])
  React.useEffect(() => {
    state.scale = getScale(size, props);
    resetScale();
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
    <div className="whiteboard">
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
  canvasWidth: 1280,
  canvasHeight: 720,
  width: 0,
  height: 0
}
export default App;
