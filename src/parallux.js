import LazyView from 'lazyview';

export default class Parallux {

  constructor(elem, options) {
    this.elem = elem;
    this.options = options;
    this.state = {
      rendering: false
    }
    this.init();
  }


  init() {

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);

    this.elements = this.elem.querySelectorAll('.parallux-item');
    console.log(this.elements)

    this.lazyView = new LazyView(this.elem,{enterClass:'in-view', ignoreInitial:false});

    this.scroll = this.lazyView.scroll;

    this.lazyView.on('enter', this.startRender.bind(this));
    this.lazyView.on('exit', this.stopRender.bind(this));

    if(this.lazyView.state.inView) {
      setTimeout(()=>{
        this.startRender();
      }, 10)
    }
  }


  startRender() {
    if(!this.state.rendering){
      // this.lazyView.update();


      // this.lazyView.update();
      this.state.rendering = true;


      this.scroll.on('scroll:start', this.onScroll);
      this.scroll.on('scroll:progress', this.onScroll);
      this.scroll.on('scroll:stop', this.onScroll);
      this.scroll.on('scroll:resize', this.onResize);
      this.onScroll();
    }
  }

  stopRender() {
    if(this.state.rendering){

      this.state.rendering = false;
      this.scroll.off('scroll:start', this.onScroll);
      this.scroll.off('scroll:progress', this.onScroll);
      this.scroll.off('scroll:stop', this.onScroll);
      this.scroll.off('scroll:resize', this.onResize);
    }
    // this.onScroll();
  }


  onScroll() {

    const scrollY = this.scroll.y;
    // const pos2 = this.elem.getBoundingClientRect();
    const pos = this.lazyView.position;
    // console.log(pos)

    const diff = (pos.bottom - scrollY);
    // console.log('diff', diff)

    // console.log(scrollY, pos)
    for(let i = 0, l = this.elements.length; i<l; i++){
      const elem = this.elements[i];
      const ratio = parseFloat(elem.dataset.paralluxRatio);
      const y = diff * ratio;
      // console.log('y', y)
      elem.setAttribute('style', 'transform: translate3d(0px, '+y+'px, 0px)');

    }
  }

  onResize() {

  }
}
