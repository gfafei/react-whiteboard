import React from 'react';
import {
  uuid,
  clearCanvas,
} from '../utils';
import Tool from './tool'

function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}

class Line extends Tool {
  constructor (state) {
    super(state)
    state.line = {
      mousePressed: false,
      points: []
    };
    this.name = 'Pencil';
    this.cursor = 'url("pencil.svg") 5 20, auto';
    this.icon = 'icon-note';
    this.label = 'Pencil';
  }

  //TODO remove param points
  drawLine(ctx, points) {
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

  draw(line) {
    const ctx = this.state.mainContext;
    ctx.strokeStyle = line.color;
    ctx.lineWidth = line.size;
    this.drawLine(ctx, line._children)
  }

  drawHitRegion(line) {
    const ctx = this.state.hitRegionContext;
    const state = this.state;
    const colorKey = this.getColorKey()
    state.colorHash[colorKey] = line.id;
    ctx.strokeStyle = colorKey;
    ctx.lineWidth = line.size;
    this.drawLine(ctx, line._children)
  }

  handleMouseDown(e) {
    const state = this.state;
    this.curlineId = uuid();
    state.line.mousePressed = true;
    state.line.points.push({ x: e.clientX, y: e.clientY });
  }

  handleMouseMove(e) {
    const state = this.state;
    if (!state.line.mousePressed) return;
    clearCanvas(state.drawingContext);
    state.line.points.push({ x: e.clientX, y: e.clientY });
    state.drawingContext.strokeStyle = state.color;
    state.drawingContext.lineWidth = state.size;
    this.drawLine(state.drawingContext, state.line.points);


  }

  handleMouseUp(e) {
    const state = this.state;
    clearCanvas(state.drawingContext);
    state.line.mousePressed = false;
    if (state.line.points.length < 2) return;
    state.mainContext.strokeStyle = state.color;
    state.mainContext.lineWidth = state.size;
    this.drawLine(state.mainContext, state.line.points)
    const line = {
      id: uuid(),
      tool: this.name,
      size: state.size,
      color: state.color,
      _children: state.line.points
    }
    state.elements.set(line.id, line)
    this.drawHitRegion(line);
    state.line.points = [];
  }
}

export default Line;
