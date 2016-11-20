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

var defaults = {
  lazyView: {},
  container: '.parallux-container',
  items: '.parallux-item'
};

var Parallux = function () {
  function Parallux(container) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Parallux);

    this.elements = [];


    this.container = container;
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
      this.onResize = this.render.bind(this);

      var children = typeof this.options.items === 'string' ? this.container.querySelectorAll(this.options.items) : this.options.items;
      this.numElements = children.length;

      this.viewPort = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      for (var i = 0; i < this.numElements; i++) {
        this.elements[i] = new ParalluxItem(children[i], this.viewPort);
      }

      this.initialRender = true;
      this.lazyView = new _lazyview2.default(this.container, this.options.lazyView);
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
      for (var i = 0; i < this.numElements; i++) {
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
        this.preRender();
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
      var hdiff = (this.scroll.clientHeight - this.lazyView.position.height) / 2;
      var diff = this.lazyView.position.bottom - hdiff - this.scroll.y;
      // console.log((this.scroll.clientHeight - diff)/ this.scroll.clientHeight );
      var percent = (this.scroll.clientHeight - diff) / this.scroll.clientHeight;
      // var percent = diff/hdiff;
      for (var i = 0; i < this.numElements; i++) {
        this.elements[i].setState(diff, percent);
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

exports.default = Parallux;

var ParalluxItem = function () {
  function ParalluxItem(node, viewPort) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, ParalluxItem);

    this.node = node;
    this.viewPort = viewPort;
    this.options = options;

    this.state = {
      y: 0,
      percent: 0
    };

    var attr = node.dataset.paralluxAttr;
    this.attr = attr ? JSON.parse(attr) : null;
    this.ratio = parseFloat(node.dataset.paralluxRatio) || 0;
    this.ratioUp = parseFloat(node.dataset.paralluxRatioUp) || this.ratio;
    this.offset = parseFloat(node.dataset.paralluxOffset) || 0;
    this.max = parseFloat(node.dataset.paralluxMax);

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

      var rect = this.node.getBoundingClientRect();
      this.position = {
        top: rect.top - offset,
        bottom: rect.bottom - offset
      };
    }
  }, {
    key: 'setWillChange',
    value: function setWillChange() {
      var styles = this.attr ? Object.keys(this.attr) : [];
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
    value: function setState(y, percent) {
      if (y < 0) {
        y = (this.offset + y) * this.ratioUp - this.offset * this.ratioUp;
      } else {
        y = (this.offset + y) * this.ratio - this.offset * this.ratio;
      }
      if (this.state.y !== y) {
        this.state.y = y;
        this.state.percent = percent;
        this.render();
      }
    }
  }, {
    key: 'getStyle',
    value: function getStyle(entry) {
      var unit = entry.unit || '';
      var to = entry.to || 0;
      var diff = entry.from - to;
      var value = entry.from - diff * this.state.percent;
      if (entry.hasOwnProperty('to') && (diff < 0 && value > to || diff > 0 && value < to)) {
        value = to;
      }
      return value + unit;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var transform = 'translateY(' + this.state.y + 'px)';
      if (this.attr) {
        Object.keys(this.attr).forEach(function (key) {
          if (key === 'transform') {
            Object.keys(_this2.attr[key]).forEach(function (tans) {
              transform += ' ' + tans + '(' + _this2.getStyle(_this2.attr[key][tans]) + ')';
            });
          } else {
            _this2.node.style[(0, _stylePrefixer.getPrefix)(key)] = _this2.getStyle(_this2.attr[key]);
          }
        });
      }
      this.node.style[(0, _stylePrefixer.getPrefix)('transform')] = transform;
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
      this.options = null;
    }
  }]);

  return ParalluxItem;
}();

module.exports = exports['default'];