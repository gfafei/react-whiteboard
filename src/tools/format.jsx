import Tool from './tool';
import clsx from 'classnames';
import React from 'react';

class Format extends Tool {
  constructor (state) {
    super(state);
    this.name = 'Format';
    this.label = 'Format';
    state.showFormat = false;
    this.sizes = [3, 5, 9, 12, 15];
    this.colors= ['#FE0000', '#FF8A01', '#FF38C7', '#6548F6',
      '#0001FE', '#51D8EB', '#49D61E', '#000000', '#807F80'];
    document.addEventListener('click', function() {
      console.log('state', state.showFormat)
      if (state.showFormat) {
        state.showFormat = false;
        state.forceUpdate();
      }
    })
  }

  handleClick() {
    const state = this.state;
    state.showFormat = true;
    state.forceUpdate();
  }

  renderNode() {
    const state = this.state;
    return (
      <div key={this.name}
         id={this.name}
         className={'menu-item'}
         onClick={this.handleClick.bind(this)}
      >
        <div className="color-indicator" style={{ backgroundColor: state.color }}/>
        <span className="tool-name">{this.label}</span>
        <div className={clsx('popup', { show: state.showFormat })}>
          <div className="size-wrapper">
            {
              this.sizes.map(size => (
                <div className={clsx('size-item', { active: size === state.size })}
                     key={size}
                     onClick={() => {
                       state.size = size
                       state.showFormat = false;
                       state.forceUpdate();
                     }}
                >
                  <div className="size-inner" style={{ width: size }}/>
                </div>
              ))
            }
          </div>
          <div className="color-wrapper">
            {
              this.colors.map(color => (
                <div className={clsx('color-item', { active: color === state.color })}
                     key={color}
                     onClick={(e) => {
                       state.color = color;
                       state.showFormat = false;
                       state.forceUpdate();
                     }}
                >
                  <div className="color-inner" style={{ backgroundColor: color }}/>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }
}

export default Format;
