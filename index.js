// import { ToyReact, Component } from './ToyReact.js';
import ToyReact, { Component } from './_ToyReact.js';

class Square extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: null
    }
  }
  render() {
    return (
      <button className="square" onClick={() => this.setState({ value: 'X'})}>
        {this.state.value}
      </button>
    )
  }
}

class Board extends Component {
  renderSquare(i) {
    return <Square value={i}/>
  }
  render() {
    return (
      <div>
        {[[1,2,3], [4,5,6], [7,8,9]].map(row => <div className="board-row">
          {row.map(item => {
            return this.renderSquare(item)
          })}
        </div>)}
      </div>
    )
  }
}

const myComponent = <Board id="board"></Board>;

ToyReact.render(myComponent, document.getElementById('app'));