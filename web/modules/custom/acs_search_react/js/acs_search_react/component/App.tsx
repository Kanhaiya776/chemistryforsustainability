import React, { Component } from "react";
import ControlledTabs from "./ControlledTabs";

interface IProps { }
interface IState { }

class App extends Component<IProps, IState> {
  render() {
    return (
      <div className="component-app">
        <ControlledTabs />
      </div>
    );
  }
}

export default App;
