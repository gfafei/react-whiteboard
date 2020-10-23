import Tool from './tool';
import clsx from "classnames";
import React from 'react';

class Shape extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Shape';
    this.label = 'Shape';
    this.icon = 'icon-rect';
    state.showShape = false;
    this.outsideClickHandler = (e) => {
      const btn = document.getElementById('Shape')
      if (!btn.contains(e.target) && state.showShape) {
        state.showShape = false;
        state.forceUpdate();
      }
    }
    window.addEventListener('mousedown', this.outsideClickHandler)
    window.addEventListener('touchstart', this.outsideClickHandler)
  }

  onUnmount() {
    window.removeEventListener('touchstart', this.outsideClickHandler);
    window.removeEventListener('touchstart', this.outsideClickHandler);
  }

  handleClick(e) {
    const state = this.state;
    state.showShape = !state.showShape;
    state.forceUpdate();
  }

  renderNode() {
    const state = this.state;
    const row1 = [
      {
        name: 'Rect',
        icon: 'icon-rect'
      },
      {
        name: 'Circle',
        icon: 'icon-circle'
      },
      {
        name: 'Line',
        icon: 'icon-line'
      },
      {
        name: 'Arrow',
        icon: 'icon-arrow'
      }
    ]
    const row2 = [
      {
        name: 'Tick',
        icon: 'icon-tick'
      },
      {
        name: 'Cross',
        icon: 'icon-cross'
      },
      {
        name: 'Heart',
        icon: 'icon-heart'
      },
      {
        name: 'Question',
        icon: 'icon-question'
      }
    ]
    return (
      <div key={this.name}
          id={this.name}
          className="menu-item"
          onClick={this.handleClick.bind(this)}
      >
        <i className={clsx('icon', this.icon)}/>
        <span className="tool-name">{this.label}</span>
        <div className={clsx('popup', { show: state.showShape })}>
          <div className="shape-row">
            {
              row1.map(tool => (
                <div key={tool.name}
                     className={clsx('tool-item', {active: state.curTool === tool.name})}
                     onClick={() => state.toolDic[tool.name].handleClick()}
                >
                  <i className={clsx('icon', tool.icon)}/>
                </div>
              ))
            }

          </div>
          <div className="shape-row">
            {
              row2.map(tool => (
                <div key={tool.name}
                     className={clsx('tool-item', {active: state.curTool === tool.name})}
                     onClick={() => state.toolDic[tool.name].handleClick()}>
                  <i className={clsx('icon', tool.icon)}/>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Shape;
