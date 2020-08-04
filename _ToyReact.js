class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(vChild) {
    vChild.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

class TextWrapper {
  constructor(text) {
    this.root = document.createTextNode(text);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}

export class Component {
  constructor() {
    this.children = [];
    this.attributes = {};
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  appendChild(vChild) {
    this.children.push(vChild);
  }
  mountTo(parent) {
    let vDom = this.render();
    this.children.forEach(child => {
      vDom.appendChild(child);
    })
    for (let name in this.attributes) {
      vDom.setAttribute(name, this.attributes[name]);
    }
    vDom.mountTo(parent);
  }
}

const ToyReact = {
  createElement: (type, attributes, ...children) => {
    let element;
    if (typeof type === 'string') {
      element = new ElementWrapper(type);
    } else {
      element = new type;
    }
    for (let name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    [...children].forEach(child => {
      if (typeof child === 'string') {
        child = new TextWrapper(child);
      }
      element.appendChild(child);
    });
    return element;
  },
  render: (vDom, element) => {
    vDom.mountTo(element);
  }
}

export default ToyReact
