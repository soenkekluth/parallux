'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lazyview = require('lazyview');

var _lazyview2 = _interopRequireDefault(_lazyview);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import Prefixer from 'inline-style-prefixer'

var defaults = {
  lazyView: {},
  container: '.parallux-container',
  items: '.parallux-item'
};

var Parallux = function () {
  function Parallux(elem) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Parallux);

    this.elem = elem;
    this.options = (0, _objectAssign2.default)({}, defaults, options);
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

      this.elements = typeof this.options.items === 'string' ? this.elem.querySelectorAll(this.options.items) : this.options.items;
      this.lazyView = new _lazyview2.default(this.elem, this.options.lazyView);

      this.scroll = this.lazyView.scroll;

      this.lazyView.on('enter', this.startRender.bind(this));
      this.lazyView.on('exit', this.stopRender.bind(this));

      setTimeout(function () {
        if (_this.lazyView.state.inView) {
          _this.startRender();
        }
      }, 10);
    }
  }, {
    key: 'startRender',
    value: function startRender() {
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
    }
  }, {
    key: 'onScroll',
    value: function onScroll() {

      var diff = this.lazyView.position.bottom - this.scroll.y;
      for (var i = 0, l = this.elements.length; i < l; i++) {
        var elem = this.elements[i];
        var offset = parseFloat(elem.dataset.paralluxOffset) || 0;
        var y = offset + diff * parseFloat(elem.dataset.paralluxRatio);
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
  }, {
    key: 'onResize',
    value: function onResize() {}
  }]);

  return Parallux;
}();

exports.default = Parallux;
module.exports = exports['default'];