import LazyView from 'lazyview';
import assign from 'object-assign';
// import Prefixer from 'inline-style-prefixer'

const defaults = {
  lazyView: {},
  container: '.parallux-container',
  items: '.parallux-item'
};

export default class Parallux {

  constructor(elem, options = {}) {
    this.elem = elem;
    this.options = assign({}, defaults, options);
    this.state = {
      rendering: false
    }

    this.init();
  }

  init() {
    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);

    this.elements = (typeof this.options.items === 'string') ? this.elem.querySelectorAll(this.options.items) : this.options.items;
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

  startRender() {
    if (!this.state.rendering) {
      // this.prefixer = new Prefixer();
      this.state.rendering = true;
      this.scroll.on('scroll:start', this.onScroll);
      this.scroll.on('scroll:progress', this.onScroll);
      this.scroll.on('scroll:stop', this.onScroll);
      this.scroll.on('scroll:resize', this.onResize);
      this.onScroll();
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

  onScroll() {

    const diff = (this.lazyView.position.bottom - this.scroll.y);
    for (let i = 0, l = this.elements.length; i < l; i++) {
      const elem = this.elements[i];
      const offset = parseFloat(elem.dataset.paralluxOffset) || 0;
      const y = offset + diff * parseFloat(elem.dataset.paralluxRatio);
      // elem.style.cssText = 'transform: translate3d(0px, '+y+'px, 0px)';
      elem.style.cssText = 'transform: translateY(' + y + 'px)';
    };

    // for(let i = 0, l = this.elements.length; i<l; i++){
    //   const elem = this.elements[i];
    //   const ratio = parseFloat(elem.dataset.paralluxRatio);
    //   const y = (diff * ratio);
    //    elem.style.cssText = 'transform: translate3d(0px, '+y+'px, 0px)';
    //   // elem.style.cssText = 'transform: translateY('+y+'px)';
    // }
  }

  onResize() {

  }
}
