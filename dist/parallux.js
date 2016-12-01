'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lazyview = require('lazyview');

var _lazyview2 = _interopRequireDefault(_lazyview);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _stylePrefixer = require('style-prefixer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getAttribute = function getAttribute(el, attribute) {
  var fallback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  if (el.hasAttribute(attribute)) {
    return el.getAttribute(attribute);
  }
  return fallback;
};

var windowY = function windowY() {
  if (typeof window !== 'undefined') {
    return window.pageYOffset || window.scrollY || 0;
  }
  return 0;
};

var Parallux = function () {
  function Parallux(container) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Parallux);

    this.elements = [];


    this.container = container;
    this.props = (0, _objectAssign2.default)({}, Parallux.defaultProps, props);

    this.state = {
      initialRender: true,
      initialized: false,
      rendering: false
    };

    this.startRender = this.startRender.bind(this);
    this.stopRender = this.stopRender.bind(this);

    if (this.props.autoInit) {
      this.init();
    }
  }

  _createClass(Parallux, [{
    key: 'init',
    value: function init() {
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

      var children = typeof this.props.items === 'string' ? this.container.querySelectorAll(this.props.items) : this.props.items;
      this.numElements = children.length;

      this.lazyView = new _lazyview2.default(this.container, this.props.lazyView);

      this.viewPort = {
        top: this.lazyView.position.bottom,
        width: this.lazyView.scroll.clientWidth,
        height: this.lazyView.scroll.clientHeight
      };

      for (var i = 0; i < this.numElements; i++) {
        this.elements[i] = new ParalluxItem(children[i], this.viewPort, { round: this.props.round });
      }

      this.lazyView.on('enter', this.startRender);
      this.lazyView.on('exit', this.stopRender);

      if (this.lazyView.state.inView) {
        this.startRender();
      }
    }
  }, {
    key: 'cachePosition',
    value: function cachePosition() {
      this.viewPort.width = this.lazyView.scroll.clientWidth;
      this.viewPort.height = this.lazyView.scroll.clientHeight;
      this.viewPort.top = this.lazyView.position.bottom;

      for (var i = 0; i < this.numElements; i++) {
        var el = this.elements[i];
        el.cachePosition(-(this.lazyView.position.bottom - this.lazyView.scroll.y));
      }
    }
  }, {
    key: 'startRender',
    value: function startRender() {

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
  }, {
    key: 'stopRender',
    value: function stopRender() {
      if (this.state.rendering) {
        this.state.rendering = false;
        this.lazyView.scroll.off('scroll:start', this.onScroll);
        this.lazyView.scroll.off('scroll:progress', this.onScroll);
        this.lazyView.scroll.off('scroll:stop', this.onScroll);
        this.lazyView.scroll.off('scroll:resize', this.onResize);
        this.postRender();
      }
    }
  }, {
    key: 'preRender',
    value: function preRender() {
      for (var i = 0; i < this.numElements; i++) {
        this.elements[i].setWillChange();
      };
    }
  }, {
    key: 'postRender',
    value: function postRender() {
      for (var i = 0; i < this.numElements; i++) {
        this.elements[i].setStyle((0, _stylePrefixer.getPrefix)('willChange'), null);
      };
    }
  }, {
    key: 'render',
    value: function render() {
      var hdiff = (this.lazyView.scroll.clientHeight - this.lazyView.position.height) * this.props.pov;
      var diff = this.lazyView.position.bottom - hdiff - this.lazyView.scroll.y + this.props.offset;
      var percent = (this.lazyView.scroll.clientHeight - diff) / this.lazyView.scroll.clientHeight;
      for (var i = 0; i < this.numElements; i++) {
        this.elements[i].setState(percent);
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
      for (var i = 0; i < this.numElements; i++) {
        this.elements[i].destroy();
      }
      this.numElements = this.elements.length = 0;
    }
  }]);

  return Parallux;
}();

Parallux.defaultProps = {
  lazyView: {},
  container: '.parallux-container',
  items: '.parallux-item',
  autoInit: true,
  round: false,
  relative: false,
  offset: 0,
  pov: 0
};
exports.default = Parallux;

var ParalluxItem = function () {
  function ParalluxItem(node, viewPort) {
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, ParalluxItem);

    this.node = node;
    this.viewPort = viewPort;
    this.props = (0, _objectAssign2.default)({}, ParalluxItem.defaultProps, props);

    this.state = {
      y: 0,
      percent: 0
    };

    var attr = getAttribute(node, 'data-parallux-attr');
    this.props.attr = attr ? JSON.parse(attr) : this.props.attr;

    this.props.ease = parseFloat(getAttribute(node, 'data-parallux-ease', this.props.ease), 10);
    this.props.ratio = parseFloat(getAttribute(node, 'data-parallux-ratio', this.props.ratio), 10);
    this.props.ratioUp = parseFloat(getAttribute(node, 'data-parallux-ratio-up', this.props.ratioUp || this.props.ratio), 10);
    this.props.ratio *= 10;
    this.props.ratioUp *= 10;

    this.props.offset = parseFloat(getAttribute(node, 'data-parallux-offset', this.props.offset), 10);
    this.props.round = JSON.parse(getAttribute(node, 'data-parallux-round', this.props.round));
    this.props.max = getAttribute(node, 'data-parallux-max', this.props.max);
    if (this.props.max !== null) {
      this.props.max = parseFloat(this.props.max, 10);
    }

    if (this.props.max !== null) {
      this.processValue = this.processMaxValue.bind(this);
    } else {
      this.processValue = this.processNullValue.bind(this);
    }

    this.transform = 'translateY(0px)';
  }

  _createClass(ParalluxItem, [{
    key: 'processNullValue',
    value: function processNullValue(value) {
      return value;
    }
  }, {
    key: 'processMaxValue',
    value: function processMaxValue(value) {
      if (value < this.props.max) {
        return this.props.max;
      }
      return value;
    }
  }, {
    key: 'cachePosition',
    value: function cachePosition() {
      var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      var rect = this.node.getBoundingClientRect();
      this.position = {
        top: parseInt(rect.top + offset, 10),
        bottom: parseInt(rect.bottom + offset, 10)
      };
    }
  }, {
    key: 'setWillChange',
    value: function setWillChange() {
      var styles = this.props.attr ? Object.keys(this.props.attr) : [];
      if (styles.indexOf('transform') === -1) {
        styles.unshift('transform');
      }
      for (var i = 0, l = styles.length; i < l; i++) {
        styles[i] = (0, _stylePrefixer.getPrefix)(styles[i]);
      }
      this.setStyle((0, _stylePrefixer.getPrefix)('willChange'), styles.join(','));
    }
  }, {
    key: 'setState',
    value: function setState(percent) {
      this.state.percent = (1 - percent) * 100;
      // (((1-percent)*100 ) -this.state.percent) * this.props.ease;
      this.state.y = this.state.percent * this.getRatio() + this.props.offset;
      //this.props.offset
      // this.state.y += ((this.state.percent * this.getRatio()) - this.state.y) * this.props.ease;
      this.render();
    }
  }, {
    key: 'getRatio',
    value: function getRatio() {
      return this.state.percent >= 0 ? this.props.ratio : this.props.ratioUp;
    }
  }, {
    key: 'getStyle',
    value: function getStyle(entry) {
      var to = entry.to || 0;
      var diff = to - entry.from;
      var value = 1 - diff / 100 * this.state.percent;
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
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      // var transform = 'translateY(' +(this.state.percent * this.getRatio()) + '%)';
      this.transform = 'translateY(' + this.state.y + 'px)';
      if (this.props.attr) {
        Object.keys(this.props.attr).forEach(function (key) {
          if (key === 'transform') {
            Object.keys(_this.props.attr[key]).forEach(function (tans) {
              _this.transform += ' ' + tans + '(' + _this.getStyle(_this.props.attr[key][tans]) + ')';
            });
          } else {
            _this.setStyle(key, _this.getStyle(_this.props.attr[key]));
          }
        });
      }
      this.setStyle('transform', this.transform);
    }
  }, {
    key: 'setStyle',
    value: function setStyle(prop, value) {
      this.node.style[(0, _stylePrefixer.getPrefix)(prop)] = value;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.node = null;
      this.props = null;
    }
  }]);

  return ParalluxItem;
}();

ParalluxItem.defaultProps = {
  attr: null,
  ratio: 0,
  ease: 1,
  round: false,
  ratioUp: 0,
  offset: 0,
  max: null
};
module.exports = exports['default'];