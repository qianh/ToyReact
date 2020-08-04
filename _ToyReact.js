class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      const funcName = RegExp.$1.replace(/^[\s\S]/, s => s.toLocaleLowerCase());
      this.root.addEventListener(funcName, value);
    }
    if (name === 'className') {
      name = 'class';
    }
    this.root.setAttribute(name, value);
  }

  createRange() {
    let range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    return range;
  }
  appendChild(vChild) {
    vChild = vChild || new TextWrapper('');
    if (typeof vChild === 'object' && vChild instanceof Array) {
      vChild.forEach(c => {
        let range = this.createRange();
        c.mountTo(range)
      })
    } else {
      let range = this.createRange();
      vChild.mountTo(range);
    }
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor(text) {
    this.root = document.createTextNode(text);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {
  constructor(props) {
    this.children = [];
    this.props = props;
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  appendChild(vChild) {
    this.children.push(vChild);
  }
  mountTo(range) {
    this.range = range;
    this.update();
  }
  update() {
    let placeholder = document.createComment("placeholder");
    let range = document.createRange();
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    range.insertNode(placeholder);
    this.range.deleteContents();
    let vDom = this.render();
    this.children.forEach(child => {
      vDom.appendChild(child);
    })
    for (let prop in this.props) {
      vDom.setAttribute(prop, this.props[prop]);
    }
    vDom.mountTo(this.range);
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === 'object') {
          if (typeof oldState[p] !== 'object') {
            oldState[p] = {}
          }
          merge(oldState[p], newState[p])
        } else {
          oldState[p] = newState[p]
        }
      }
    }
    if (!this.state && state) {
      this.state = state;
    }
    merge(this.state, state);
    this.update();
  }
}

const TextWrapperTypeList = ['string', 'number', 'boolean'];

const ToyReact = {
  createElement: (type, attributes, ...children) => {
    let element;
    if (typeof type === 'string') {
      element = new ElementWrapper(type);
    } else {
      element = new type(attributes);
    }
    for (let name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    [...children].forEach(child => {
      if (TextWrapperTypeList.includes(typeof child)) {
        child = new TextWrapper(child);
      }
      element.appendChild(child);
    });
    return element;
  },
  render: (vDom, element) => {
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vDom.mountTo(range);
  }
}

export default ToyReact
