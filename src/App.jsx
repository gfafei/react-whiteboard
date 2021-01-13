import React, { useEffect, useRef } from 'react';
import './App.css';
import './iconfont.css';
import Pencil from './tools/pencil';
import Eraser from './tools/eraser';
import Rect from './tools/shape/rect';
import Clear from './tools/clear';
import io from 'socket.io-client';
import lan from './lan';
import Format from './tools/format'
import {fillBackground, isMobile, debounce, isIframe} from './utils';
import PropTypes from 'prop-types';
import clsx from 'classnames';
import Undo from "./tools/undo";
import Redo from "./tools/redo";
import Shape from './tools/shape';
import Text from "./tools/text";
import Save from "./tools/save";
import Circle from "./tools/shape/circle";
import Line from "./tools/shape/line";
import Arrow from "./tools/shape/arrow";
import Tick from "./tools/shape/tick";
import Cross from "./tools/shape/cross";
import Heart from "./tools/shape/heart";
import Question from "./tools/shape/question";

const initialState = {
  scale: 1,
  background: '#ffffff',
  color: '#FE0000',
  size: 5,
  points: [],
  toolDic: {},
  tools: [],
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
  width,
  height
}) => {
  const scaleX = size.width / width;
  const scaleY = size.height / height;
  return Math.min(scaleX, scaleY);
}
const App = React.forwardRef((props, ref) => {
  const mainLayerRef = useRef(null)
  const stateRef = useRef(initialState);
  const state = stateRef.current;
  const forceUpdate = useForceUpdate();
  const [size, setSize] = React.useState({
    width: props.containerWidth || window.innerWidth,
    height: props.containerHeight || window.innerHeight
  });

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
    state.context.canvas.height = props.height * state.scale;
    state.context.canvas.width = props.width * state.scale;
    state.context.scale(state.scale, state.scale);

    state.hitRegionContext.canvas.height = props.height * state.scale;
    state.hitRegionContext.canvas.width = props.width * state.scale;
    state.hitRegionContext.scale(state.scale, state.scale);
  }

  useEffect(() => {
    state.context = mainLayerRef.current.getContext('2d');
    if (ref) {
      ref.current = mainLayerRef.current;
    }
    state.visitor = props.visitor;
    state.owner = props.owner;
    state.i18n = lan(props.lang);
    const mainCtx = state.context;
    state.scale = getScale(size, props);
    const hitRegion = document.createElement('canvas');
    state.hitRegionContext = hitRegion.getContext('2d');
    resetScale();
    fillBackground(mainCtx, state.scale, state.background);

    state.toolDic['Pencil'] = new Pencil(state);
    state.toolDic['Rect'] = new Rect(state);
    state.toolDic['Circle'] = new Circle(state);
    state.toolDic['Line'] = new Line(state);
    state.toolDic['Arrow'] = new Arrow(state);
    state.toolDic['Tick'] = new Tick(state);
    state.toolDic['Cross'] = new Cross(state);
    state.toolDic['Heart'] = new Heart(state);
    state.toolDic['Question'] = new Question(state);
    state.toolDic['Shape'] = new Shape(state);
    state.toolDic['Text'] = new Text(state);
    state.toolDic['Format'] = new Format(state);
    state.toolDic['Eraser'] = new Eraser(state);
    state.toolDic['Undo'] = new Undo(state);
    state.toolDic['Redo'] = new Redo(state);
    state.toolDic['Clear'] = new Clear(state);
    state.toolDic['Save'] = new Save(state);
    if (!isMobile()) {
      state.tools.push(
        'Pencil',
        'Rect',
        'Circle',
        'Line',
        'Arrow',
        'Tick',
        'Cross',
        'Heart',
        'Question',
        'Shape'
      )
    }
    state.tools.push(
      'Text',
      'Format',
      'Eraser',
      'Undo',
      'Redo'
    )
    if (props.visitor === props.owner) {
      state.tools.push('Clear')
    }
    state.tools.push('Save')
    state.curTool = 'Pencil';
    mainLayerRef.current.style.cursor = state.toolDic[state.curTool].cursor;
    state.forceUpdate = forceUpdate;
    state.canvas = mainLayerRef.current;
    forceUpdate();

    const socket = io({
      transports: ['websocket'],
      path: '/whiteboard/socket'
    });
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
    document.title = state.boardName;
    return () => {
      state.toolDic['Format'].onUnmount();
      state.toolDic['Shape'].onUnmount();
    }
  }, []);
  React.useEffect(() => {
    if (!isMobile() && isIframe()) return;
    const resizeHandler = debounce(() => {
      state.scale = getScale({
        width: window.innerWidth,
        height: window.innerHeight
      }, props)
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
      resetScale();
      state.toolDic['Pencil'].refresh();
    }, 80)
    window.addEventListener('resize', resizeHandler)
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])
  useEffect(() => {
    setSize({
      width: props.containerWidth,
      height: props.containerHeight
    });
    state.scale = getScale({
      width: props.containerWidth,
      height: props.containerHeight
    }, props);
    resetScale();
    state.toolDic['Pencil'].refresh();
  }, [props.containerWidth, props.containerHeight]);

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
      <div className={clsx('menu-wrapper', { hide: props.hideToolbar })}>
        {
          state.tools.map(name => state.toolDic[name].renderNode())
        }
      </div>
    </div>
  )
})

App.propsTypes = {
  name: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  containerWidth: PropTypes.number,
  containerHeight: PropTypes.number,
  owner: PropTypes.string,
  visitor: PropTypes.string,
  lang: PropTypes.string,
  hideToolbar: PropTypes.bool
}
App.defaultProps = {
  name: 'anonymous',
  containerWidth: window.innerWidth,
  containerHeight: window.innerHeight,
  width: window.innerWidth,
  height: window.innerHeight,
  hideToolbar: false
}

export default App;
