import LazyView from 'lazyview';
import assign from 'object-assign';
import { getPrefix } from 'style-prefixer';

const getAttribute = (el, attribute, fallback = null) => {
  if (el.hasAttribute(attribute)) {
    return el.getAttribute(attribute);
  }
  return fallback;
}

const windowY = () => {
  if (typeof window !== 'undefined') {
    return (window.pageYOffset || window.scrollY || 0);
  }
  return 0;
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

    if (this.props.autoInit) {
      this.init();
    }
  }

  init() {
    if (this.state.initialized) {
      console.warn('Parallux is already initialized');
      return;
    }

    this.state.initialized = true;
    this.props.pov = parseFloat(getAttribute(this.container, 'data-parallux-pov', this.props.pov), 10);
    this.props.relative = JSON.parse(getAttribute(this.container, 'data-parallux-relative', this.props.relative));
    this.props.round = JSON.parse(getAttribute(this.container, 'data-parallux-round', this.props.round));
    this.props.offset = parseFloat(getAttribute(this.container, 'data-parallux-offset', this.props.offset), 10);

    this.onScroll = this.render.bind(this);
    this.onResize = this.render.bind(this);

    var children = (typeof this.props.items === 'string' && this.props.items.length) ? this.container.querySelectorAll(this.props.items) : this.props.items;
    this.numElements = children ? children.length : 0;
    this.props.lazyView.threshold = this.props.offset;
    this.lazyView = new LazyView(this.container, this.props.lazyView);

    this.viewPort = {
      top: this.lazyView.position.top,
      width: this.lazyView.scroll.clientWidth,
      height: this.lazyView.scroll.clientHeight
    }

    for (let i = 0; i < this.numElements; i++) {
      this.elements[i] = new ParalluxItem(children[i], this.viewPort, { round: this.props.round });
    }

    this.lazyView.on('enter', this.startRender);
    this.lazyView.on('exit', this.stopRender);

    if (this.lazyView.state.inView) {
      this.startRender();
    }
  }


  cachePosition() {
    this.viewPort.width = this.lazyView.scroll.clientWidth;
    this.viewPort.height = this.lazyView.scroll.clientHeight;
    this.viewPort.top = this.lazyView.position.top

    for (let i = 0; i < this.numElements; i++) {
      const el = this.elements[i];
      el.cachePosition(-(this.lazyView.position.top - this.lazyView.scroll.y));
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
    // const hdiff = (this.lazyView.scroll.clientHeight - this.lazyView.position.height) * this.props.pov;
    // const diff = (this.lazyView.position.top - hdiff - this.lazyView.scroll.y) + this.props.offset;
    // var percent = (this.lazyView.scroll.clientHeight - diff) / this.lazyView.scroll.clientHeight;

    // const innerProgress =( (this.lazyView.position.top - this.lazyView.scroll.clientHeight - this.lazyView.scroll.y)  / -this.lazyView.position.height);
    // const progress = this.lazyView.state.progress;
    // const topProgress = (progress * (this.lazyView.position.top + this.lazyView.position.height)) / this.lazyView.scroll.clientHeight;
    const percent = this.lazyView.state.progress + (1 - this.props.pov); //( innerProgress  * this.props.pov)- innerProgress;
    // const percent = topProgress + (1-this.props.pov);//( innerProgress  * this.props.pov)- innerProgress;
    // const percent = innerProgress + this.props.pov ;//( innerProgress  * this.props.pov)- innerProgress;
    // const bottomProgress = (progress * (this.lazyView.position.bottom - this.lazyView.position.height)) / this.lazyView.scroll.clientHeight;
    // const perc = topProgress /* this.props.pov*/;
    // console.log(topProgress, innerProgress, percent)
    // console.log(progress, topProgress, bottomProgress)
    // console.log(progress, topProgress ,this.props.pov , percent)
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
    style: null,
    ratio: 0,
    ease: 1,
    round: false,
    ratioUp: 0,
    offset: 0,
    max: null,
    min: null,
  };

  constructor(node, viewPort, props = {}) {

    this.node = node;
    this.viewPort = viewPort;
    this.props = assign({}, ParalluxItem.defaultProps, props);

    this.state = {
      y: 0,
      percent: 0
    }

    const style = getAttribute(node, 'data-parallux-style');
    this.props.style = style ? JSON.parse(style) : this.props.style;

    this.props.ease = parseFloat(getAttribute(node, 'data-parallux-ease', this.props.ease), 10);
    this.props.ratio = parseFloat(getAttribute(node, 'data-parallux-ratio', this.props.ratio), 10);
    this.props.ratioUp = parseFloat(getAttribute(node, 'data-parallux-ratio-up', (this.props.ratioUp || this.props.ratio)), 10);
    this.props.ratio *= 10;
    this.props.ratioUp *= 10;

    this.props.offset = parseFloat(getAttribute(node, 'data-parallux-offset', this.props.offset), 10);
    this.props.round = JSON.parse(getAttribute(node, 'data-parallux-round', this.props.round));
    this.props.max = getAttribute(node, 'data-parallux-max', this.props.max);
    this.props.min = getAttribute(node, 'data-parallux-min', this.props.min);
    if (this.props.max !== null) {
      this.props.max = parseFloat(this.props.max, 10);
    }
    if (this.props.min !== null) {
      this.props.min = parseFloat(this.props.min, 10);
    }


    if (this.props.max !== null && this.props.min !== null) {
      this.processValue = this.processMinMaxValue.bind(this);
    } else if (this.props.max !== null) {
      this.processValue = this.processMaxValue.bind(this);
    } else if (this.props.min !== null) {
      this.processValue = this.processMaxValue.bind(this);
    } else {
      this.processValue = this.processNullValue.bind(this);
    }

    this.transform = 'translateY(0px)';
  }


  processNullValue(value) {
    return value;
  }

  // processMinMaxValue(value) {
  //   if()
  // }

  processMaxValue(value) {
    if (value < this.props.max) {
      return this.props.max;
    }
    return value;
  }

  processMinValue(value) {
    if (value > this.props.min) {
      return this.props.min;
    }
    return value;
  }

  cachePosition(offset = 0) {
    var rect = this.node.getBoundingClientRect();
    this.position = {
      top: parseInt(rect.top + offset, 10),
      bottom: parseInt(rect.bottom + offset, 10)
    }
  }

  setWillChange() {
    let styles = this.props.style ? Object.keys(this.props.style) : [];
    if (styles.indexOf('transform') === -1) {
      styles.unshift('transform');
    }
    for (let i = 0, l = styles.length; i < l; i++) {
      styles[i] = getPrefix(styles[i]);
    }
    this.setStyle(getPrefix('willChange'), styles.join(','));
  }

  setState(percent) {
    this.state.percent = (1 - percent) * 100;
    // (((1-percent)*100 ) -this.state.percent) * this.props.ease;
    this.state.y = (this.state.percent * this.getRatio()) + this.props.offset;
    //this.props.offset
    // this.state.y += ((this.state.percent * this.getRatio()) - this.state.y) * this.props.ease;
    this.render();
  }

  getRatio() {
    return ((this.state.percent >= 0) ? this.props.ratio : this.props.ratioUp);
  }


  getStyle(entry) {
    const to = entry.to || 0;
    const diff = to - entry.from;
    var value = 1 - (diff / 100) * this.state.percent;
    if (entry.hasOwnProperty('to')) {
      if (diff > 0) {
        value = value > to ? to : value;
        value = value < entry.from ? entry.from : value;
      } else {
        value = value < to ? to : value;
        value = value > entry.from ? entry.from : value;
      }
    }
    return value + (entry.unit ? entry.unit : '');
  }

  render() {
    // var transform = 'translateY(' +(this.state.percent * this.getRatio()) + '%)';
    this.transform = 'translateY(' + (this.state.y) + 'px)';
    if (this.props.style) {
      Object.keys(this.props.style).forEach(key => {
        if (key === 'transform') {
          Object.keys(this.props.style[key]).forEach(tans => {
            this.transform += ' ' + tans + '(' + this.getStyle(this.props.style[key][tans]) + ')';
          });
        } else {
          this.setStyle(key, this.getStyle(this.props.style[key]));
        }
      });
    }
    this.setStyle('transform', this.transform);
  }

  setStyle(prop, value) {
    this.node.style[getPrefix(prop)] = value;
  }

  destroy() {
    this.node = null;
    this.props = null;
  }

}
