import LazyView from 'lazyview';
import assign from 'object-assign';
import { getPrefix } from 'style-prefixer';

const defaults = {
  lazyView: {},
  container: '.parallux-container',
  items: '.parallux-item',
  relative: true,
  pov: 0.5
};

export default class Parallux {

  elements = [];

  constructor(container, options = {}) {

    this.container = container;
    this.options = assign({}, defaults, options);
    this.options.pov = this.container.getAttribute('data-parallux-pov') || this.options.pov;
    this.options.relative = !!(this.container.getAttribute('data-parallux-relative'));
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

    this.initialRender = true;
    this.lazyView = new LazyView(this.container, this.options.lazyView);


    for (let i = 0; i < this.numElements; i++) {
      this.elements[i] = new ParalluxItem(children[i], this.viewPort);
    }

    this.lazyView.on('enter', this.startRender.bind(this));
    this.lazyView.on('exit', this.stopRender.bind(this));
  }


  cachePosition() {
    for (let i = 0; i < this.numElements; i++) {
      const el = this.elements[i];
      el.cachePosition(this.lazyView.position.bottom - this.scroll.y);
    }
  }

  startRender() {

    if (!this.state.rendering) {
      if (this.initialRender) {
        this.scroll = this.lazyView.scroll;
        this.viewPort = {
          width: this.scroll.clientWidth,
          height: this.scroll.clientHeight
        }
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
    const hdiff = (this.scroll.clientHeight - this.lazyView.position.height) * this.options.pov;
    const diff = (this.lazyView.position.bottom - hdiff - this.scroll.y);
    var percent = (this.scroll.clientHeight - diff) / this.scroll.clientHeight;
    for (let i = 0; i < this.numElements; i++) {
      const top = !this.options.relative ? this.elements[i].position.top :  0;
      const y = this.elements[i].offset + diff + top;
      this.elements[i].setState(y, percent);
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

    const attr = node.getAttribute('data-parallux-attr');
    this.attr = attr ? JSON.parse(attr) : null;
    this.ratio = parseFloat(node.getAttribute('data-parallux-ratio')) || 0;
    this.ratioUp = parseFloat(node.getAttribute('data-parallux-ratio-up')) || this.ratio;
    this.offset = parseFloat(node.getAttribute('data-parallux-offset')) || 0;
    this.max = parseFloat(node.getAttribute('data-parallux-max'));

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
      top: rect.top - offset ,
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
      y  *= this.ratioUp /*- (this.offset * this.ratioUp)*/;
    } else {
      y *= this.ratio/* - (this.offset * this.ratio)*/
    }

    if (this.state.y !== y) {
      this.state.y = y;
      this.state.percent = percent;
      this.render();
    }
  }


  getStyle(entry){
    var unit = entry.unit || '';
    var to = entry.to || 0;
    const diff = entry.from - to;
    var value = (entry.from - diff * this.state.percent);
    if(entry.hasOwnProperty('to') && ((diff < 0 && value > to) || (diff > 0 && value < to))){
     value = to
    }
    return value + unit;
  }

  render() {
    var transform = 'translateY(' + this.state.y + 'px)';
    if (this.attr) {
      Object.keys(this.attr).forEach(key => {
        if (key === 'transform') {
          Object.keys(this.attr[key]).forEach(tans => {
            transform += ' ' + tans + '(' + this.getStyle(this.attr[key][tans]) + ')';
          });
        } else {
          this.node.style[getPrefix(key)] = this.getStyle(this.attr[key]);
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
