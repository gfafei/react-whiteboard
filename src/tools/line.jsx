import React from 'react';
import {
  uuid,
} from '../utils';
import Tool from './tool';

let lastTime = 0;
class Line extends Tool {
  constructor (state) {
    super(state)
    this.name = 'Pencil';
    this.cursor = 'url("pencil.svg") 5 20, auto';
    this.icon = 'icon-note';
    this.label = 'Pencil';
  }

  drawLine(lineId) {
    const line = this.state.elements.get(lineId);
    let ctx = this.state.context;
    const points = line.points;
    if (points.length < 2) return;
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.closePath();
    ctx.lineWidth = line.size;
    ctx.strokeStyle = line.color;
    ctx.stroke();

    ctx = this.state.hitRegionContext;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.closePath();
    ctx.lineWidth = line.size;
    ctx.strokeStyle = line.colorKey;
    ctx.stroke();
  }

  draw(line) {
    let ctx = this.state.context;
    const start = line.points[0];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y)
    for (let i = 1; i < line.points.length; i++) {
      const point = line.points[i];
      ctx.lineTo(point.x, point.y);
    }
    ctx.lineWidth = line.size;
    ctx.strokeStyle = line.color;
    ctx.stroke();

    ctx = this.state.hitRegionContext;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y)
    for (let i = 1; i < line.points.length; i++) {
      const point = line.points[i];
      ctx.lineTo(point.x, point.y);
    }
    ctx.lineWidth = line.size;
    ctx.strokeStyle = line.colorKey;
    ctx.stroke();
  }

  addPoint(lineId, point) {
    const line = this.state.elements.get(this.curLineId);
    if (!line) {
      throw Error(`line with id ${this.curLineId} does not exist`)
    }
    line.points.push(point);
    this.drawLine(this.curLineId);
  }

  handleMouseDown(e) {
    const state = this.state;
    this.curLineId = uuid();
    const line = {
      tool: this.name,
      type: 'line',
      id: this.curLineId,
      color: state.color,
      colorKey: this.getColorKey(),
      size: state.size,
      points: [{ x: e.clientX, y: e.clientY }],
    }
    state.colorHash.set(line.colorKey, line.id)
    state.elements.set(this.curLineId, line);
  }

  handleMouseMove(e) {
    lastTime = performance.now()
    this.addPoint(this.curLineId, { x: e.clientX, y: e.clientY });
  }

  handleMouseUp(e) {
    this.addPoint(this.curLineId, { x: e.clientX, y: e.clientY });
  }
}

export default Line;
