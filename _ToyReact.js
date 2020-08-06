let childrenSymbol = Symbol('children');
class ElementWrapper {
  constructor(type, props) {
    this.type = type;
    this.props = Object.create(null);
    this[childrenSymbol] = [];
    this.children = [];
    for (const name in props) {
      this.setAttribute(name, props[name]);
    }
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  createRange(element) {
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    return range;
  }

  appendChild(vChild) {
    this[childrenSymbol].push(vChild);
    this.children.push(vChild.vDom);
  }

  get vDom() {
    return this;
  }

  mountTo(range) {
    this.range = range;
    let placeholder = document.createComment("placeholder");
    let endRange = document.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEnd(range.endContainer, range.endOffset);
    endRange.insertNode(placeholder);

    range.deleteContents();
    let element = document.createElement(this.type);
    for(let name in this.props) {
      const value = this.props[name];
      if (name.match(/^on([\s\S]+)$/)) {
        const funcName = RegExp.$1.replace(/^[\s\S]/, s => s.toLocaleLowerCase());
        element.addEventListener(funcName, value);
      }
      if (name === 'className') {
        name = 'class';
      }
      element.setAttribute(name, value);
    }
    for(let child of this.children) {
      let range = this.createRange(element);
      child.mountTo(range);
    }
    range.insertNode(element);
  }
}

class TextWrapper {
  constructor(text) {
    this.root = document.createTextNode(text);
    this.type = "#text";
    this.children = [];
    this.props = Object.create(null);
  }

  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }

  get vDom() {
    return this;
  }
}

export class Component {
  constructor(props) {
    this.children = [];
    this.props = props;
  }

  get type() {
    return this.constructor.name;
  }

  appendChild(vChild) {
    this.children.push(vChild);
  }

  mountTo(range) {
    this.range = range;
    this.update();
  }

  appendChildrenToDom(vDom) {
    this.children.forEach(child => {
      vDom.appendChild(child);
    })
    for (let prop in this.props) {
      vDom.setAttribute(prop, this.props[prop]);
    }
    return vDom;
  }

  update() {
    let vDom = this.vDom;
    if (this.oldVDom) {
      let isSameNode = (node1 = {}, node2 = {}) => {
        if (node1.type !== node2.type) {
          return false;
        }
        for(let name in node1.props) {
          if (typeof node1.props[name] === 'object' && typeof node2.props[name] === 'object'
            && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])) {
              continue;
          }
          if (node1.props[name] !== node2.props[name]) {
            return false;
          }
        }
        if (node1.children.length !== node2.children.length) {
          return false;
        }
        if (Object.keys(node1.props).length !== Object.keys(node2.props).length) {
          return false;
        }
        return true;
      }
      let isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) {
          return false;
        }
        if (node1.children.length !== node2.children.length) {
          return false
        }
        for(let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i])) {
            return false
          }
        }
        return true;
      }
      let replace = (newTree, oldTree) => {
        if (isSameTree(newTree, oldTree)) {
          return;
        }
        if (!isSameNode(newTree, oldTree)) {
          newTree = this.appendChildrenToDom(newTree);
          newTree.mountTo(oldTree.range);
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i]);
          }
        }
      }
      replace(vDom, this.oldVDom);
    } else {
      vDom = this.appendChildrenToDom(vDom);
      vDom.mountTo(this.range);
    }
    this.oldVDom = vDom;
  }

  get vDom() {
    return this.render().vDom;
  }

  setState(state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === 'object' && newState[p] !== null) {
          if (typeof oldState[p] !== 'object') {
            if (newState[p] instanceof Array ) {
              oldState[p] = [];
            } else {
              oldState[p] = {};
            }
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
      element = new ElementWrapper(type, attributes);
    } else {
      element = new type(attributes);
    }
    [...children].forEach(child => {
      if (child === null || child === void 0) {
        child = '';
      }
      if (TextWrapperTypeList.includes(typeof child)) {
        child = new TextWrapper(child);
      }
      if (child instanceof Array) {
        for(let c of child) {
          element.appendChild(c);
        }
      } else {
        element.appendChild(child);
      }
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
