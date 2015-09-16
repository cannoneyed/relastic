import _ from 'lodash'

class Relastic {
	constructor (composition = {query: {}}, keys = ['query'], root = true) {
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

	addToComposition (address, obj) {
		var target, parent
		var currentAddress = this.keys.join('.')
		var lookup = currentAddress + '.' + address

		if (isBool(_.last(this.keys))) {
			parent = _.get(this.composition, currentAddress)
			if (parent === undefined || Object.keys(parent).length === 0) {
				_.set(this.composition, currentAddress, {[address]: obj})
				return
			}

			if (!(parent instanceof Array)) {
				_.set(this.composition, currentAddress, [parent])
			}

			parent = _.get(this.composition, currentAddress)
			if (parent instanceof Array) {
				_.set(this.composition, currentAddress, parent.concat({[address]: obj}))
				return [_.get(this.composition, currentAddress).length - 1, address]
			}
		}

		target = _.get(this.composition, lookup)
		if (target === undefined || Object.keys(target).length === 0) {
			_.set(this.composition, lookup, clone(obj))
			return address
		}


	}

	pushKey (key) {
		this.keys = this.keys.concat(key)
	}

	addAndPush (key, obj) {
		var nextKey = this.addToComposition(key, obj)
		this.pushKey(nextKey)
	}

	chainable(fn) {
		var next = new this.constructor(this.composition, this.keys, false)
		if (next.root) {
			next.keys = ['query']
		}
		fn.call(next)
		return next
	}

	filteredQuery () {
		return this.chainable(function () {
			this.addToComposition('filtered.query', {})
			this.addToComposition('filtered.filter', {})
			this.pushKey('filtered')
		})
	}

	filter (obj = {}) {
		return this.chainable(function () {
			this.addAndPush('filter', obj)
		})
	}

	query (obj = {}) {
		return this.chainable(function () {
			this.addAndPush('query', obj)
		})
	}

	match (obj = {}) {
		return this.Sibling('match', obj)
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

	gotoLastParent () {
		var lastIndex = _.findLastIndex(this.keys, (key) => isParent(key))
		this.keys = this.keys.slice(0, lastIndex + 1)
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

}


var r = new Relastic()
var bool = r.filteredQuery().filter().bool()

bool.printKeys()


bool
	.must()
		.term({folder: 'inbox'})
		.term({hockey: 'stick'})
		.term({sweet: 'NO'})
		.terms({cheese: ['cheddar', 'mozarella']})
		.bool()
			.should()
			.term({name: 'HEY'})
			.term({hey: 2})

bool.must_not()
	.term({folder: 'HEY!'})

// r.filteredQuery().query().match({'name': 'ANDU'})

// bool.must().term({hockey: 'stick'})


// r.filteredQuery().filter().bool().must_not().query().match({email: 'urgent business proposal'})
	// .query()
	// .match({email: 'urgent business proposal'})

// bool.should()
// 	.terms({cheese: ['Rocquefort', 'Cheddar']})


// r.query()

console.log( JSON.stringify(r.output(), null, 2) )




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
