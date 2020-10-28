import { clearCanvas, fillBackground, getRandomColor } from '../utils'
import clsx from 'classnames';
import React from 'react';

class Tool {
  constructor (state) {
    this.state = state;
    this.name = '';
    this.icon = '';
    this.label = '';
    this.cursor = 'default';
  }

  getColorKey() {
    const state = this.state;
    while (true) {
      const colorKey = getRandomColor();
      if (!state.colorHash[colorKey]) {
        return colorKey;
      }
    }
  }

  send(data) {
    this.cacheMessage(data);
    const message = {
      board: this.state.boardName,
      data: data
    }
    this.state.socket.emit('broadcast', message);
  }

  drawAndSend(data, skipAction) {
    if (this.state.visitor) {
      data.creator = this.state.visitor;
    }
    const tool = this.state.toolDic[data.tool];
    tool.draw(data);
    if (!skipAction) {
      this.emitAction(data);
    }
    this.send(data);
  }

  refresh() {
    const state = this.state;
    clearCanvas(state.context, state.scale);
    fillBackground(state.context, state.scale, state.background);
    clearCanvas(state.hitRegionContext, state.scale);
    state.colorHash.clear();
    state.elements.forEach(element => {
      const tool = state.toolDic[element.tool];
      if (!tool) {
        throw Error(`tool ${element.tool} does not exist`)
      }
      tool.draw(element);
    })
  }

  handleMouseDown() {}

  handleMouseMove() {}

  handleMouseUp() {}

  handleClick() {
    const state = this.state;
    state.curTool = this.name;
    state.canvas.style.cursor = this.cursor;
    state.forceUpdate();
  }

  draw() {}

  renderNode() {
    const state = this.state;
    return (
      <div key={this.name}
           id={this.name}
           className={clsx('menu-item', { active: state.curTool === this.name })}
           onClick={this.handleClick.bind(this)}
      >
        <i className={clsx('icon', this.icon)}/>
        <span className="tool-name">{this.label}</span>
      </div>
    )
  }

  cacheMessage(message) {
    const state = this.state;
    let v = state.store.get(message.id);
    switch (message.type) {
      case 'delete':
      case 'clear':
        break;
      case 'child':
        v = state.store.get(message.parent);
        if (!v) {
          throw Error(`line with id ${message.parent} does not exist`)
        }
        v._children = v._children || [];
        v._children.push(message);
        break;
      case 'update':
        if (!v) {
          throw Error('element does not exist')
        }
        if (v.tool === 'Text') {
          v.txt = message.txt;
        } else {
          v.x2 = message.x2;
          v.y2 = message.y2;
        }
        break;
      default:
        const newMsg = Object.assign({}, message);
        delete newMsg._children;
        state.store.set(message.id, newMsg);
        break;
    }
  }

  getUndoAction(action) {
    const res = {
      payload: action.payload
    }
    switch (action.type) {
      case 'clear':
        res.type = 'batch';
        break;
      case 'delete':
        res.type = 'draw';
        break;
      case 'draw':
        res.type = 'delete';
        break;
      default:
        throw Error('unknown type action');
    }
    return res;
  }

  emitAction(message) {
    const state = this.state;
    let type = 'draw';
    if (['update', 'points'].indexOf(message.type) > -1) return;
    if (['clear', 'delete'].indexOf(message.type) > -1) {
      type = message.type;
    }
    state.undoStack.push({
      type: type,
      payload: message.id || message.ids
    });
    state.forceUpdate();
  }

  handleAction(action) {
    const state = this.state;
    const skip = true;
    let msg, id;
    switch (action.type) {
      case 'delete':
        id = action.payload;
        msg = {
          tool: 'Eraser',
          type: 'delete',
          id: id
        }
        this.drawAndSend(msg, skip)
        break;
      case 'clear':
        msg = {
          tool: 'Clear',
          type: 'clear',
          ids: action.payload
        }
        this.drawAndSend(msg, skip);
        break;
      case 'batch':
        const ids = action.payload;
        const children = [];
        ids.forEach((id) => {
          msg = state.store.get(id);
          if (!msg) throw Error('cannot find element in action');
          children.push(msg);
          const tool = state.toolDic[msg.tool];
          tool.draw(msg);
          if (msg._children) {
            msg._children.forEach((child) => {
              tool.draw(child);
            })
          }
        })
        state.socket.emit('broadcast', {
          board: state.boardName,
          data: { type: 'batch', _children: children }
        });
        break;
      case 'draw':
        id = action.payload;
        msg = state.store.get(id);
        if (!msg) throw Error('cannot find element in action');
        this.drawAndSend(msg, skip);
        if (msg._children) {
          const tool = state.toolDic[msg.tool];
          msg._children.forEach((child) => {
            tool.draw(child);
            this.cacheMessage(child);
          })
        }
        break;
    }
  }
}

export default Tool;
