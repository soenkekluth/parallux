import LazyView from 'lazyview';
import assign from 'object-assign';
// import Prefixer from 'inline-style-prefixer'

const defaults = {
  lazyView: {},
  container: '.parallux-container',
  items: '.parallux-item'
};

export default class Parallux {

  elements = [];

  constructor(elem, options = {}) {

    this.elem = elem;
    this.options = assign({}, defaults, options);

    this.state = {
      rendering: false
    }

    this.init();
  }

  init() {

    this.onScroll = this.render.bind(this);
    this.onResize = this.onResize.bind(this);

    var children = (typeof this.options.items === 'string') ? this.elem.querySelectorAll(this.options.items) : this.options.items;
    this.numElements = children.length;

    for (let i = 0; i < this.numElements; i++) {
      this.elements[i] = new ParalluxItem(children[i]);
    }

    this.initialRender = true;
    this.lazyView = new LazyView(this.elem, this.options.lazyView);
    this.scroll = this.lazyView.scroll;

    this.lazyView.on('enter', this.startRender.bind(this));
    this.lazyView.on('exit', this.stopRender.bind(this));

    setTimeout(() => {
      if (this.lazyView.state.inView) {
        this.startRender();
      }
    }, 10)
  }


  cachePosition(){
    for (let i = 0; i < this.numElements; i++) {
      const el = this.elements[i];
      el.cachePosition(this.lazyView.position.bottom);
    }
  }

  startRender() {
    if (!this.state.rendering) {
      if(this.initialRender){
        this.initialRender = false;
        this.cachePosition();
      }
      // this.prefixer = new Prefixer();
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
    }
  }

  render() {
    // const diff = (this.lazyView.position.bottom - this.scroll.y);
    const diff = (this.scroll.y - this.lazyView.position.bottom)

    for (let i = 0; i < this.numElements; i++) {
      this.elements[i].y = diff;
      // const elem = this.elements[i];
      // elem.y = diff;
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

  onResize() {

  }
}



class ParalluxItem {

  constructor(elem, options = {}) {

    this.elem = elem;
    this.options = options;
    this._y = 0;
    this._lastY = 0;

    this.ratio = parseFloat(elem.dataset.paralluxRatio) || 0;
    this.ratioUp = parseFloat(elem.dataset.paralluxRatioUp) || this.ratio;
    this.offset = parseFloat(elem.dataset.paralluxOffset) || 0;
    this.max = parseFloat(elem.dataset.paralluxMax);

    if(!isNaN(this.max)){
      this.processValue = this.processMaxValue.bind(this);
    }else{
      this.processValue = this.processNullValue.bind(this);
    }
  }


  processNullValue(value){
    return value;
  }

  processMaxValue(value){
    if(value < this.max){
      return this.max;
    }
    return value;
  }

  cachePosition(offset = 0) {
    var rect =  this.elem.getBoundingClientRect();
    this.position = {
      top : rect.top - offset,
      bottom : rect.bottom - offset
    }
    // console.log(this.position);
  }


  render() {
    this.elem.style.cssText = 'transform: translateY(' + this._y + 'px)';
    // elem.style.cssText = 'transform: translate3d(0px, '+y+'px, 0px)';
  }

  destroy() {
    this.elem = null;
    this.options = null;
  }

  set y(value) {

    value = this.processValue(value);
    this._y = ((this.offset + value) * this.ratio) - (this.offset * this.ratio);
    if(this._y < 0){
      this._y = ((this.offset + value) * this.ratioUp) - (this.offset * this.ratioUp);
    }
    if(this._lastY !== this._y){
      this.render();
    }
    this._lastY = this._y;
  }

  get y() {
    return this._y;
  }

}
