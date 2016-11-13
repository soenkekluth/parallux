'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lazyview = require('lazyview');

var _lazyview2 = _interopRequireDefault(_lazyview);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Parallux = function () {
  function Parallux(elem, options) {
    _classCallCheck(this, Parallux);

    this.elem = elem;
    this.options = options;
    this.state = {
      rendering: false
    };
    this.init();
  }

  _createClass(Parallux, [{
    key: 'init',
    value: function init() {
      var _this = this;

      this.onScroll = this.onScroll.bind(this);
      this.onResize = this.onResize.bind(this);

      this.elements = this.elem.querySelectorAll('.parallux-item');
      console.log(this.elements);

      this.lazyView = new _lazyview2.default(this.elem, { enterClass: 'in-view', ignoreInitial: false });

      this.scroll = this.lazyView.scroll;

      this.lazyView.on('enter', this.startRender.bind(this));
      this.lazyView.on('exit', this.stopRender.bind(this));

      if (this.lazyView.state.inView) {
        setTimeout(function () {
          _this.startRender();
        }, 10);
      }
    }
  }, {
    key: 'startRender',
    value: function startRender() {
      if (!this.state.rendering) {
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
  }, {
    key: 'stopRender',
    value: function stopRender() {
      if (this.state.rendering) {

        this.state.rendering = false;
        this.scroll.off('scroll:start', this.onScroll);
        this.scroll.off('scroll:progress', this.onScroll);
        this.scroll.off('scroll:stop', this.onScroll);
        this.scroll.off('scroll:resize', this.onResize);
      }
      // this.onScroll();
    }
  }, {
    key: 'onScroll',
    value: function onScroll() {

      var scrollY = this.scroll.y;
      // const pos2 = this.elem.getBoundingClientRect();
      var pos = this.lazyView.position;
      // console.log(pos)

      var diff = pos.bottom - scrollY;
      // console.log('diff', diff)

      // console.log(scrollY, pos)
      for (var i = 0, l = this.elements.length; i < l; i++) {
        var elem = this.elements[i];
        var ratio = parseFloat(elem.dataset.paralluxRatio);
        var y = diff * ratio;
        // console.log('y', y)
        // elem.setAttribute('style', 'transform: translate3d(0px, '+y+'px, 0px)');
        elem.setAttribute('style', 'transform: translateY(' + y + 'px)');
      }
    }
  }, {
    key: 'onResize',
    value: function onResize() {}
  }]);

  return Parallux;
}();

exports.default = Parallux;
module.exports = exports['default'];