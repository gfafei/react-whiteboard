import Tool from "./tool";
import clsx from "classnames";
import React from "react";

class Undo extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Undo';
    this.icon = 'icon-undo';
    this.label = 'Undo';
  }

  handleClick() {
    const state = this.state;
    if (!state.undoStack.length) return;
    const action = state.undoStack.pop();
    this.handleAction(this.getUndoAction(action));
    state.redoStack.push(action);
    state.forceUpdate();
  }

  renderNode() {
    const state = this.state;
    return (
      <div key={this.name}
           id={this.name}
           className={clsx('menu-item', { disabled: !state.undoStack.length })}
           onClick={this.handleClick.bind(this)}
      >
        <i className={clsx('icon', this.icon)}/>
        <span className="tool-name">{state.i18n(this.name)}</span>
      </div>
    )
  }
}

export default Undo;
