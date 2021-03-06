import _ from 'lodash'

class Relastic {
	constructor (composition = {query: {}}, keys = [], root = true) {
		this.composition = composition
		this.keys = keys.slice()
		this.root = root
	}

	output () {
		return clone(this.composition)
	}

	print () {
		console.log(JSON.stringify(this.composition, null, 2))
	}

	printKeys () {
		console.log(this.keys)
	}

	addToComposition (key, obj) {
		var target, parent
		var currentAddress = this.keys.join('.')
		var lookup = currentAddress + '.' + key

		if (_.last(this.keys) === key) {
			_.set(this.composition, currentAddress, obj)
			return key
		}

		if (isBool(_.last(this.keys))) {
			parent = _.get(this.composition, currentAddress)
			if (parent === undefined || Object.keys(parent).length === 0) {
				_.set(this.composition, currentAddress, {[key]: obj})
				return
			}

			if (!(parent instanceof Array)) {
				_.set(this.composition, currentAddress, [parent])
			}

			parent = _.get(this.composition, currentAddress)
			if (parent instanceof Array) {
				_.set(this.composition, currentAddress, parent.concat({[key]: obj}))
				return [_.get(this.composition, currentAddress).length - 1, key]
			}
		}

		target = _.get(this.composition, lookup)
		if (target === undefined || Object.keys(target).length === 0) {
			_.set(this.composition, lookup, clone(obj))
			return key
		}


	}

	pushKey (key) {
		this.keys = this.keys.concat(key)
	}

	addAndPush (key, obj) {
		var nextKey = this.addToComposition(key, obj)
		if (key !== _.last(this.keys)) {
			this.pushKey(nextKey)
		}
	}

	chainable(fn) {
		var next = new Relastic(this.composition, this.keys, false)
		if (next.root) {
			next.keys = ['query']
		}
		fn.call(next)
		return next
	}

	filteredQuery () {
		return this.chainable(function () {
			this.addToComposition('query.filtered.query', {})
			this.addToComposition('query.filtered.filter', {})
			this.pushKey(['query', 'filtered'])
		})
	}

	filter (obj = {}) {
		return this.chainable(function () {
			this.addAndPush('filter', obj)
		})
	}

	filtered (obj = {}) {
		return this.chainable(function () {
			this.addAndPush('filtered', obj)
		})
	}

	query (obj = {}) {
		return this.chainable(function () {
			this.addAndPush('query', obj)
		})
	}

	bool (obj = {}) {
		return this.chainable(function () {
			this.addAndPush('bool', obj)
		})
	}

	must (obj = {}) {
		return this.chainable(function () {
			this.addAndPush('must', obj)
		})
	}

	must_not (obj = {}) {
		return this.chainable(function () {
			this.addAndPush('must_not', obj)
		})
	}

	should (obj = {}) {
		return this.chainable(function () {
			this.addAndPush('should', obj)
		})
	}





	Sibling (method, obj) {
		this.gotoLastParent()
		return this.chainable(function () {
			this.addToComposition(method, obj)
		})
	}

	term (obj = {}) {
		return this.Sibling('term', obj)
	}

	terms (obj = {}) {
		return this.Sibling('terms', obj)
	}

	match (obj = {}) {
		return this.Sibling('match', obj)
	}

	match_all () {
		return this.Sibling('match_all', {})
	}

	minimum_should_match (n = 1) {
		if (_.last(this.keys) === 'should') {
			this.keys.pop()
			return this.Sibling('minimum_should_match', n)
		} else {
			return
		}
	}

	range (obj = {}) {
		return this.Sibling('range', obj)
	}

	exists (obj = {}) {
		return this.Sibling('exists', obj)
	}

	missing (obj = {}) {
		return this.Sibling('missing', obj)
	}

	gotoLastParent () {
		var lastIndex = _.findLastIndex(this.keys, (key) => isParent(key))
		this.keys = this.keys.slice(0, lastIndex + 1)
	}



}

export default Relastic


function isParent (method) {
	var parentMethods = ['bool', 'filter', 'query', 'must', 'must_not', 'should']
	return _.contains(parentMethods, method)
}

function isBool (method) {
	return _.contains(['must', 'must_not', 'should'], method)
}

function clone (obj) {
	return _.clone(obj, true)
}

function extend (destination, source) {
	return _.extend(destination, source)
}
