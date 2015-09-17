'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var Relastic = (function () {
	function Relastic() {
		var composition = arguments.length <= 0 || arguments[0] === undefined ? { query: {} } : arguments[0];
		var keys = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
		var root = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

		_classCallCheck(this, Relastic);

		this.composition = composition;
		this.keys = keys.slice();
		this.root = root;
	}

	_createClass(Relastic, [{
		key: 'output',
		value: function output() {
			return clone(this.composition);
		}
	}, {
		key: 'print',
		value: function print() {
			console.log(JSON.stringify(this.composition, null, 2));
		}
	}, {
		key: 'printKeys',
		value: function printKeys() {
			console.log(this.keys);
		}
	}, {
		key: 'addToComposition',
		value: function addToComposition(key, obj) {
			var target, parent;
			var currentAddress = this.keys.join('.');
			var lookup = currentAddress + '.' + key;

			if (_lodash2['default'].last(this.keys) === key) {
				_lodash2['default'].set(this.composition, currentAddress, obj);
				return key;
			}

			if (isBool(_lodash2['default'].last(this.keys))) {
				parent = _lodash2['default'].get(this.composition, currentAddress);
				if (parent === undefined || Object.keys(parent).length === 0) {
					_lodash2['default'].set(this.composition, currentAddress, _defineProperty({}, key, obj));
					return;
				}

				if (!(parent instanceof Array)) {
					_lodash2['default'].set(this.composition, currentAddress, [parent]);
				}

				parent = _lodash2['default'].get(this.composition, currentAddress);
				if (parent instanceof Array) {
					_lodash2['default'].set(this.composition, currentAddress, parent.concat(_defineProperty({}, key, obj)));
					return [_lodash2['default'].get(this.composition, currentAddress).length - 1, key];
				}
			}

			target = _lodash2['default'].get(this.composition, lookup);
			if (target === undefined || Object.keys(target).length === 0) {
				_lodash2['default'].set(this.composition, lookup, clone(obj));
				return key;
			}
		}
	}, {
		key: 'pushKey',
		value: function pushKey(key) {
			this.keys = this.keys.concat(key);
		}
	}, {
		key: 'addAndPush',
		value: function addAndPush(key, obj) {
			var nextKey = this.addToComposition(key, obj);
			if (key !== _lodash2['default'].last(this.keys)) {
				this.pushKey(nextKey);
			}
		}
	}, {
		key: 'chainable',
		value: function chainable(fn) {
			var next = new Relastic(this.composition, this.keys, false);
			if (next.root) {
				next.keys = ['query'];
			}
			fn.call(next);
			return next;
		}
	}, {
		key: 'filteredQuery',
		value: function filteredQuery() {
			return this.chainable(function () {
				this.addToComposition('query.filtered.query', {});
				this.addToComposition('query.filtered.filter', {});
				this.pushKey(['query', 'filtered']);
			});
		}
	}, {
		key: 'filter',
		value: function filter() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.chainable(function () {
				this.addAndPush('filter', obj);
			});
		}
	}, {
		key: 'filtered',
		value: function filtered() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.chainable(function () {
				this.addAndPush('filtered', obj);
			});
		}
	}, {
		key: 'query',
		value: function query() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.chainable(function () {
				this.addAndPush('query', obj);
			});
		}
	}, {
		key: 'bool',
		value: function bool() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.chainable(function () {
				this.addAndPush('bool', obj);
			});
		}
	}, {
		key: 'must',
		value: function must() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.chainable(function () {
				this.addAndPush('must', obj);
			});
		}
	}, {
		key: 'must_not',
		value: function must_not() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.chainable(function () {
				this.addAndPush('must_not', obj);
			});
		}
	}, {
		key: 'should',
		value: function should() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.chainable(function () {
				this.addAndPush('should', obj);
			});
		}
	}, {
		key: 'Sibling',
		value: function Sibling(method, obj) {
			this.gotoLastParent();
			return this.chainable(function () {
				this.addToComposition(method, obj);
			});
		}
	}, {
		key: 'term',
		value: function term() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.Sibling('term', obj);
		}
	}, {
		key: 'terms',
		value: function terms() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.Sibling('terms', obj);
		}
	}, {
		key: 'match',
		value: function match() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.Sibling('match', obj);
		}
	}, {
		key: 'minimum_should_match',
		value: function minimum_should_match() {
			var n = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];

			if (_lodash2['default'].last(this.keys) === 'should') {
				this.keys.pop();
				return this.Sibling('minimum_should_match', n);
			} else {
				return;
			}
		}
	}, {
		key: 'range',
		value: function range() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.Sibling('range', obj);
		}
	}, {
		key: 'exists',
		value: function exists() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.Sibling('exists', obj);
		}
	}, {
		key: 'missing',
		value: function missing() {
			var obj = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			return this.Sibling('missing', obj);
		}
	}, {
		key: 'gotoLastParent',
		value: function gotoLastParent() {
			var lastIndex = _lodash2['default'].findLastIndex(this.keys, function (key) {
				return isParent(key);
			});
			this.keys = this.keys.slice(0, lastIndex + 1);
		}
	}]);

	return Relastic;
})();

exports['default'] = Relastic;

function isParent(method) {
	var parentMethods = ['bool', 'filter', 'query', 'must', 'must_not', 'should'];
	return _lodash2['default'].contains(parentMethods, method);
}

function isBool(method) {
	return _lodash2['default'].contains(['must', 'must_not', 'should'], method);
}

function clone(obj) {
	return _lodash2['default'].clone(obj, true);
}

function extend(destination, source) {
	return _lodash2['default'].extend(destination, source);
}
module.exports = exports['default'];