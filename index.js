import { ToyReact, Component } from './ToyReact.js';

class MyComponent extends Component {
  render() {
    return <div>
      <span>Hello </span>
      <span>World !</span>
    </div>
  }
}

const myComponent = <MyComponent name="a">
  <div>123</div>
  <div>木头人</div>
</MyComponent>;

ToyReact.render(myComponent, document.getElementById('app'));