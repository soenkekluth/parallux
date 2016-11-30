import LazyView from 'lazyview';
import assign from 'object-assign';
import { getPrefix } from 'style-prefixer';


const getAttribute = (el, attribute, fallback = null)=> {
  if(el.hasAttribute(attribute)){
    return el.getAttribute(attribute);
  }
  return fallback;
}

const windowY =() => {
  return (window.pageYOffset || window.scrollY || 0);
}


export default class Parallux {

  static defaultProps = {
    lazyView: {},
    container: '.parallux-container',
    items: '.parallux-item',
    autoInit: true,
    round: false,
    relative: false,
    offset: 0,
    pov: 0
  };

  elements = [];

  constructor(container, props = {}) {

    this.container = container;
    this.props = assign({}, Parallux.defaultProps, props);

    this.state = {
      initialRender: true,
      initialized: false,
      rendering: false
    }

    this.startRender = this.startRender.bind(this);
    this.stopRender = this.stopRender.bind(this);

    if(this.props.autoInit) {
      this.init();
    }
  }

  init() {
    if(this.state.initialized){
      console.warn('Parallux is already initialized');
      return;
    }

    this.state.initialized = true;
    this.props.pov = parseFloat(getAttribute(this.container, 'data-parallux-pov', this.props.pov),10);
    this.props.relative = JSON.parse(getAttribute(this.container, 'data-parallux-relative', this.props.relative));
    this.props.round = JSON.parse(getAttribute(this.container, 'data-parallux-round', this.props.round));
    this.props.offset = parseFloat(getAttribute(this.container, 'data-parallux-offset', this.props.offset), 10);

    this.onScroll = this.render.bind(this);
    this.onResize = this.render.bind(this);

    var children = (typeof this.props.items === 'string') ? this.container.querySelectorAll(this.props.items) : this.props.items;
    this.numElements = children.length;

    this.lazyView = new LazyView(this.container, this.props.lazyView);

    this.viewPort = {
      top: this.lazyView.position.bottom,
      width: this.lazyView.scroll.clientWidth,
      height: this.lazyView.scroll.clientHeight
    }

    for (let i = 0; i < this.numElements; i++) {
      this.elements[i] = new ParalluxItem(children[i], this.viewPort, {round: this.props.round});
    }

    this.lazyView.on('enter', this.startRender);
    this.lazyView.on('exit', this.stopRender);

    if(this.lazyView.state.inView){
      this.startRender();
    }
  }


  cachePosition() {
    this.viewPort.width = this.lazyView.scroll.clientWidth;
    this.viewPort.height = this.lazyView.scroll.clientHeight;
    this.viewPort.top =  this.lazyView.position.bottom

    for (let i = 0; i < this.numElements; i++) {
      const el = this.elements[i];
      el.cachePosition(-(this.lazyView.position.bottom - this.lazyView.scroll.y));
    }
  }

  startRender() {

    if (!this.state.rendering) {
      this.state.rendering = true;

      if (this.state.initialRender) {
        this.state.initialRender = false;
        this.cachePosition();
      }
      this.preRender();
      this.lazyView.scroll.on('scroll:start', this.onScroll);
      this.lazyView.scroll.on('scroll:progress', this.onScroll);
      this.lazyView.scroll.on('scroll:stop', this.onScroll);
      this.lazyView.scroll.on('scroll:resize', this.onResize);
      this.render();
    }
  }

  stopRender() {
    if (this.state.rendering) {
      this.state.rendering = false;
      this.lazyView.scroll.off('scroll:start', this.onScroll);
      this.lazyView.scroll.off('scroll:progress', this.onScroll);
      this.lazyView.scroll.off('scroll:stop', this.onScroll);
      this.lazyView.scroll.off('scroll:resize', this.onResize);
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
    const hdiff = (this.lazyView.scroll.clientHeight - this.lazyView.position.height) * this.props.pov;
    const diff = (this.lazyView.position.bottom - hdiff - this.lazyView.scroll.y) + this.props.offset;
    var percent = (this.lazyView.scroll.clientHeight - diff) / this.lazyView.scroll.clientHeight;
    for (let i = 0; i < this.numElements; i++) {
      this.elements[i].setState(percent);
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

  static defaultProps = {
    attr: null,
    ratio: 0,
    ease: 1,
    round: false,
    ratioUp: 0,
    offset: 0,
    max: null
  };

  constructor(node, viewPort, props = {}) {

    this.node = node;
    this.viewPort = viewPort;
    this.props = assign({}, ParalluxItem.defaultProps, props);

    this.state = {
      y: 0,
      percent: 0
    }

    const attr = getAttribute(node, 'data-parallux-attr');
    this.props.attr = attr ? JSON.parse(attr) : this.props.attr;

    this.props.ease = parseFloat(getAttribute(node, 'data-parallux-ease', this.props.ease), 10);
    this.props.ratio = parseFloat(getAttribute(node, 'data-parallux-ratio', this.props.ratio), 10);
    this.props.ratioUp = parseFloat(getAttribute(node, 'data-parallux-ratio-up', (this.props.ratioUp || this.props.ratio)), 10);
    this.props.ratio *= 10;
    this.props.ratioUp *= 10;

    this.props.offset = parseFloat(getAttribute(node, 'data-parallux-offset', this.props.offset), 10);
    this.props.round = JSON.parse(getAttribute(node, 'data-parallux-round', this.props.round));
    this.props.max = getAttribute(node, 'data-parallux-max', this.props.max);
    if(this.props.max !== null){
      this.props.max = parseFloat(this.props.max, 10);
    }

    if (this.props.max !== null) {
      this.processValue = this.processMaxValue.bind(this);
    } else {
      this.processValue = this.processNullValue.bind(this);
    }
  }


  processNullValue(value) {
    return value;
  }

  processMaxValue(value) {
    if (value < this.props.max) {
      return this.props.max;
    }
    return value;
  }

  cachePosition(offset = 0) {
    var rect = this.node.getBoundingClientRect();
    this.position = {
      top: parseInt(rect.top + offset, 10) ,
      bottom: parseInt(rect.bottom  + offset, 10)
    }
  }

  setWillChange() {
    let styles = this.props.attr ? Object.keys(this.props.attr) : [];
    if (styles.indexOf('transform') === -1) {
      styles.unshift('transform');
    }
    for (let i = 0, l = styles.length; i < l; i++) {
      styles[i] = getPrefix(styles[i]);
    }
    this.setStyle(getPrefix('willChange'), styles.join(','));
  }

  setState(percent) {
    this.state.percent += (((1-percent)*100 ) -this.state.percent) * this.props.ease;
    this.render();
  }

  getRatio() {
    return ((this.state.percent >= 0) ? this.props.ratio : this.props.ratioUp);
  }


  getStyle(entry){
    const to = entry.to || 0;
    const diff = to - entry.from;
    var value = 1 - (diff / 100) * this.state.percent;
    if(entry.hasOwnProperty('to')){
      if(diff > 0){
        value = value > to ? to : value;
        value = value < entry.from ? entry.from : value;
      }else{
        value = value < to ? to : value;
        value = value > entry.from ? entry.from : value;
      }
    }
    return value + (entry.unit ? entry.unit : '');
  }

  render() {
    // var transform = 'translateY(' +(this.state.percent * this.getRatio()) + '%)';
    var transform = 'translateY(' + (this.state.percent * this.getRatio()) + 'px)';
    if (this.props.attr) {
      Object.keys(this.props.attr).forEach(key => {
        if (key === 'transform') {
          Object.keys(this.props.attr[key]).forEach(tans => {
            transform += ' ' + tans + '(' + this.getStyle(this.props.attr[key][tans]) + ')';
          });
        } else {
          this.setStyle(key, this.getStyle(this.props.attr[key]));
        }
      });
    }
    this.setStyle('transform', transform);
  }

  setStyle(prop, value) {
    this.node.style[getPrefix(prop)] = value;
  }

  destroy() {
    this.node = null;
    this.props = null;
  }

}
