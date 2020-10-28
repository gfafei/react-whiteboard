import Tool from './tool';
import clsx from "classnames";
import React from "react";

class Redo extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Redo';
    this.icon = 'icon-redo';
    this.label = 'Redo';
  }

  handleClick() {
    const state = this.state;
    if (!state.redoStack.length) return;
    const action = state.redoStack.pop();
    this.handleAction(action);
    state.undoStack.push(action);
    state.forceUpdate();
  }

  renderNode() {
    const state = this.state;
    return (
      <div key={this.name}
           id={this.name}
           className={clsx('menu-item', { disabled: !state.redoStack.length })}
           onClick={this.handleClick.bind(this)}
      >
        <i className={clsx('icon', this.icon)}/>
        <span className="tool-name">{state.i18n(this.name)}</span>
      </div>
    )
  }
}

export default Redo;
