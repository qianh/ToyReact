// import { ToyReact, Component } from './ToyReact.js';
import ToyReact, { Component } from './_ToyReact.js';

class MyComponent extends Component {
  render() {
    return <div>
      <span>Hello </span>
      <span>World !</span>
    </div>
  }
}

class User extends Component {
  render() {
    return (
      <div id="user">
        <div>123</div>
        <div>木头人</div>
      </div>
    )
  }
}

const myComponent = <MyComponent name="a" id="myComponent">
  <User />
</MyComponent>;

ToyReact.render(myComponent, document.getElementById('app'));