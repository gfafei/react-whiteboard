import React, { useEffect, useRef } from 'react'
import './App.css'
import './iconfont.css'
import { uuid } from './utils'

const initialState = {
  mousePressed: false,
  color: '#f00056',
  size: 5,
  points: [],
  toolList: {},
  elements: new Map(),
  curTool: null,
  //主画布
  mainContext: null,
  //正在绘制的画布
  drawingContext: null,
  //选择命中区域的画布
  hitRegionContext: null,
}
const canvasStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
}
function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}

const drawLine = (ctx, points) => {
  let p1 = points[0];
  let p2 = points[1];
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  for (let i = 1; i < points.length; i++) {
    const midPoint = midPointBtw(p1, p2)
    ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
    p1 = points[i];
    p2 = points[i + 1];
  }
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
  ctx.closePath();
}

const App = () => {
  const canvasRef = useRef(null)
  const mainLayerRef = useRef(null)
  const stateRef = useRef(initialState);
  const state = stateRef.current;
  useEffect(() => {
    state.mainContext = mainLayerRef.current.getContext('2d')
    state.drawingContext =  canvasRef.current.getContext('2d')

    const ctx = state.drawingContext;
    const mainCtx = state.mainContext;
    ctx.lineWidth = mainCtx.lineWidth = state.size;
    ctx.strokeStyle = mainCtx.strokeStyle = state.color;
    ctx.lineJoin = mainCtx.strokeStyle = 'round';
    ctx.lineCap = mainCtx.lineCap = 'round';

    const hitRegion = document.createElement('canvas')

  }, [])

  const handleMouseDown = (e) => {
    state.mousePressed = true;
    state.points.push({ x: e.clientX, y: e.clientY })
  }
  const handleMouseMove = (e) => {
    const ctx = state.drawingContext
    if (!state.mousePressed) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    state.points.push({ x: e.clientX, y: e.clientY })
    drawLine(ctx, state.points);
  }

  const handleMouseUp = () => {
    const ctx = state.drawingContext;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    state.mousePressed = false;
    if (state.points.length > 2) {
      drawLine(state.mainContext, state.points);
      const line = {
        id: uuid(),
        type: 'line',
        _children: state.points
      }
      state.elements.set(line.id, line)
    }
    state.points = [];
  }

  const handleEraserClick = () => {
    const elements = state.elements;
    const key = Array.from(elements.keys())[0]
    elements.delete(key)
    const ctx = state.mainContext
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    elements.forEach((element) => {
      drawLine(state.mainContext, element._children)
    });
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
      <div className="menu-wrapper">
        <div className="menu-item">
          <i className="icon icon-note" />
          <span className="tool-name">Pencil</span>
        </div>
        <div className="menu-item" onClick={handleEraserClick}>
          <i className="icon icon-eraser" />
          <span className="tool-name">Eraser</span>
        </div>
      </div>
    </div>
  )
}

export default App;
