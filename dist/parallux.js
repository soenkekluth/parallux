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

    this.elements = [];


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

      this.onScroll = this.render.bind(this);
      this.onResize = this.onResize.bind(this);

      var children = typeof this.options.items === 'string' ? this.elem.querySelectorAll(this.options.items) : this.options.items;

      for (var i = 0, l = children.length; i < l; i++) {
        this.elements[i] = new ParalluxItem(children[i]);
      }

      this.initialRender = true;
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
    key: 'cachePosition',
    value: function cachePosition() {
      for (var i = 0, l = this.elements.length; i < l; i++) {
        var el = this.elements[i];
        el.cachePosition(this.lazyView.position.bottom);
      }
    }
  }, {
    key: 'startRender',
    value: function startRender() {
      if (!this.state.rendering) {
        if (this.initialRender) {
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
    key: 'render',
    value: function render() {
      // const diff = (this.lazyView.position.bottom - this.scroll.y);
      var diff = this.scroll.y - this.lazyView.position.bottom;

      for (var i = 0, l = this.elements.length; i < l; i++) {
        var elem = this.elements[i];
        // elem.y = (elem.offset + diff) * elem.ratio;
        // elem.y = (diff * elem.ratio) + elem.offset;
        // elem.y = (diff * elem.ratio - elem.offset * elem.ratio);
        elem.y = diff;
      };
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.stopRender();
      this.lazyView.destory();
      this.onScroll = null;
      this.onResize = null;
      this.elem = null;
      for (var i = 0, l = this.elements.length; i < l; i++) {
        this.elements[i].destroy();
      }
      this.elements.length = 0;
    }
  }, {
    key: 'onResize',
    value: function onResize() {}
  }]);

  return Parallux;
}();

exports.default = Parallux;

var ParalluxItem = function () {
  function ParalluxItem(elem) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ParalluxItem);

    this.elem = elem;
    this.options = options;
    this._y = 0;
    this._lastY = 0;

    this.ratio = parseFloat(elem.dataset.paralluxRatio) || 0;
    this.ratioUp = parseFloat(elem.dataset.paralluxRatioUp) || this.ratio;
    this.offset = parseFloat(elem.dataset.paralluxOffset) || 0;
    this.max = parseFloat(elem.dataset.paralluxMax);

    if (!isNaN(this.max)) {
      this.processValue = this.processMaxValue.bind(this);
    } else {
      this.processValue = this.processNullValue.bind(this);
    }
  }

  _createClass(ParalluxItem, [{
    key: 'processNullValue',
    value: function processNullValue(value) {
      return value;
    }
  }, {
    key: 'processMaxValue',
    value: function processMaxValue(value) {
      if (value < this.max) {
        return this.max;
      }
      return value;
    }
  }, {
    key: 'cachePosition',
    value: function cachePosition() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var rect = this.elem.getBoundingClientRect();
      this.position = {
        top: rect.top - offset,
        bottom: rect.bottom - offset
      };
      // console.log(this.position);
    }
  }, {
    key: 'render',
    value: function render() {
      this.elem.style.cssText = 'transform: translateY(' + this._y + 'px)';
      // elem.style.cssText = 'transform: translate3d(0px, '+y+'px, 0px)';
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.elem = null;
      this.options = null;
    }
  }, {
    key: 'y',
    set: function set(value) {

      value = this.processValue(value);
      this._y = (this.offset + value) * this.ratio - this.offset * this.ratio;
      if (this._y < 0) {
        this._y = (this.offset + value) * this.ratioUp - this.offset * this.ratioUp;
      }
      if (this._lastY !== this._y) {
        this.render();
      }
      this._lastY = this._y;
    },
    get: function get() {
      return this._y;
    }
  }]);

  return ParalluxItem;
}();

module.exports = exports['default'];