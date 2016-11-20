import LazyView from 'lazyview';
import assign from 'object-assign';
import { getPrefix } from 'style-prefixer';

const defaults = {
  lazyView: {},
  container: '.parallux-container',
  items: '.parallux-item'
};

export default class Parallux {

  elements = [];

  constructor(container, options = {}) {

    this.container = container;
    this.options = assign({}, defaults, options);

    this.state = {
      rendering: false
    }

    this.init();
  }

  init() {

    this.onScroll = this.render.bind(this);
    this.onResize = this.render.bind(this);

    var children = (typeof this.options.items === 'string') ? this.container.querySelectorAll(this.options.items) : this.options.items;
    this.numElements = children.length;

    this.viewPort = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    for (let i = 0; i < this.numElements; i++) {
      this.elements[i] = new ParalluxItem(children[i], this.viewPort);
    }

    this.initialRender = true;
    this.lazyView = new LazyView(this.container, this.options.lazyView);
    this.scroll = this.lazyView.scroll;

    this.lazyView.on('enter', this.startRender.bind(this));
    this.lazyView.on('exit', this.stopRender.bind(this));

    setTimeout(() => {
      if (this.lazyView.state.inView) {
        this.startRender();
      }
    }, 10)
  }


  cachePosition() {
    for (let i = 0; i < this.numElements; i++) {
      const el = this.elements[i];
      el.cachePosition(this.lazyView.position.bottom);
    }
  }

  startRender() {
    if (!this.state.rendering) {
      if (this.initialRender) {
        this.initialRender = false;
        this.cachePosition();
      }
      this.preRender();
      this.state.rendering = true;
      this.scroll.on('scroll:start', this.onScroll);
      this.scroll.on('scroll:progress', this.onScroll);
      this.scroll.on('scroll:stop', this.onScroll);
      this.scroll.on('scroll:resize', this.onResize);
      this.render();
    }
  }

  stopRender() {
    if (this.state.rendering) {
      this.state.rendering = false;
      this.scroll.off('scroll:start', this.onScroll);
      this.scroll.off('scroll:progress', this.onScroll);
      this.scroll.off('scroll:stop', this.onScroll);
      this.scroll.off('scroll:resize', this.onResize);
      this.postRender();
    }
  }

  preRender() {
    for (let i = 0; i < this.numElements; i++) {
      this.elements[i].setWillChange();
    };
  }

  postRender() {
    for (let i = 0; i < this.numElements; i++) {
      this.elements[i].setStyle(getPrefix('willChange'), null);
    };
  }

  render() {
    const diff = (this.lazyView.position.bottom - this.scroll.y);
    var percent = (this.scroll.clientHeight - diff) / this.scroll.clientHeight;
    for (let i = 0; i < this.numElements; i++) {
      this.elements[i].setState(diff, percent);
    };
  }


  destroy() {
    this.stopRender();
    this.lazyView.destory();
    this.onScroll = null;
    this.onResize = null;
    this.elem = null;
    for (let i = 0; i < this.numElements; i++) {
      this.elements[i].destroy();
    }
    this.numElements = this.elements.length = 0;
  }
}



class ParalluxItem {

  constructor(node, viewPort, options = {}) {

    this.node = node;
    this.viewPort = viewPort;
    this.options = options;

    this.state = {
      y: 0,
      percent: 0
    }


    const attr = node.dataset.paralluxAttr;
    this.attr = attr ? JSON.parse(attr) : null;
    this.ratio = parseFloat(node.dataset.paralluxRatio) || 0;
    this.ratioUp = parseFloat(node.dataset.paralluxRatioUp) || this.ratio;
    this.offset = parseFloat(node.dataset.paralluxOffset) || 0;
    this.max = parseFloat(node.dataset.paralluxMax);

    if (!isNaN(this.max)) {
      this.processValue = this.processMaxValue.bind(this);
    } else {
      this.processValue = this.processNullValue.bind(this);
    }
  }


  processNullValue(value) {
    return value;
  }

  processMaxValue(value) {
    if (value < this.max) {
      return this.max;
    }
    return value;
  }

  cachePosition(offset = 0) {
    var rect = this.node.getBoundingClientRect();
    this.position = {
      top: rect.top - offset,
      bottom: rect.bottom - offset
    }
  }

  setWillChange() {
    let styles = this.attr ? Object.keys(this.attr) : [];
    if (styles.indexOf('transform') === -1) {
      styles.unshift('transform');
    }
    for (let i = 0, l = styles.length; i < l; i++) {
      styles[i] = getPrefix(styles[i]);
    }
    this.setStyle(getPrefix('willChange'), styles.join(','));
  }

  setState(y, percent) {
    if (y < 0) {
      y = ((this.offset + y) * this.ratioUp) - (this.offset * this.ratioUp);
    } else {
      y = ((this.offset + y) * this.ratio) - (this.offset * this.ratio)
    }
    if (this.state.y !== y) {
      this.state.y = y;
      this.state.percent = percent;
      this.render();
    }
  }

  render() {
    var transform = 'translateY(' + this.state.y + 'px)';
    if (this.attr) {
      Object.keys(this.attr).forEach(key => {
        var unit = this.attr[key].unit || '';
        var value = (this.attr[key].from - (this.attr[key].from - this.attr[key].to) * this.state.percent) + unit;
        if (key === 'transform') {
          transform += ' ' + this.attr[key].prop + '(' + value + ')';
        } else {
          this.node.style[getPrefix(key)] = value;
        }
      });

    }
    this.node.style[getPrefix('transform')] = transform;
  }

  setStyle(prop, value) {
    this.node.style[getPrefix(prop)] = value;
  }

  destroy() {
    this.node = null;
    this.options = null;
  }

}
