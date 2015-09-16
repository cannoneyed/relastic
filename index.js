import _ from 'lodash'

class Relastic {
	constructor () {
		this.composition = {query: {}}
		this.pointer = this.composition.query
		this.address = 'query'
		this.parent = this.composition

		this.initMethods()

		this.initChainable()
		return this
	}

	print () {
		console.log(JSON.stringify(this.composition, null, 2))
	}

	initMethods () {
		this.methods = []
		var categories = {
			queries: {
				methods: ['match', 'match_all'],
			},
			filters: {
				methods: ['term', 'terms', 'range', 'exists', 'missing'],
			},
			parents: {
				methods: ['filteredQuery', 'query', 'filter', 'bool'],
			},
			bools: {
				methods: ['must', 'must_not', 'should'],
			},
		}

		_.each(categories, (category, name) => {
			_.each(category.methods, (method) => {
				this.methods.push(method)
			})
		})
	}

	initChainable () {
		this.__chainable = {}
		_.each(this.methods, (method) => {
			this.__chainable[method] = makeChainable(this[method])
		})

		var self = this
		function makeChainable (fn) {
			return function (q) {
				return fn.call(self, q, false)
			}
		}
	}



	chainable (fn, root) {
		if (root) {
			this.pointer = this.composition.query
		}

		fn.call(this)
		return this.__chainable
	}

	setPointer (address) {
		if (address == undefined) {
			return
		}
		this.parent = this.pointer
		this.address = address
		this.pointer = this.pointer[address]
	}




	Parent (address, obj, root = true) {
		if (this.address === address) {
			return this.chainable(function () {
				this.setPointer()
			}, root)
		}

		return this.chainable(function () {
			if (this.pointer[address] === undefined) {
				this.pointer[address] = clone(obj)
			}
			this.setPointer(address)
		}, root)
	}

	filteredQuery (__null, root = true) {
		return this.Parent('filtered', {query: {}, filter: {}}, root)
	}

	query (obj = {}, root = true) {
		return this.Parent('query', obj, root)
	}

	filter (obj = {}, root = true) {
		return this.Parent('filter', obj, root)
	}

	bool (obj = {}, root = true) {
		return this.Parent('bool', obj, root)
	}


	isBool (address) {
		return ['should', 'must', 'must_not'].indexOf(address) !== -1
	}

	Bool (address, obj, root = true) {
		if (this.address === address) {
			return this.chainable(function () {
				this.setPointer()
			}, root)
		}

		return this.chainable(function () {
			if (this.pointer[address] === undefined) {
				this.pointer[address] = clone(obj)
			}
			this.setPointer(address)
		}, root)
	}


	should (obj = {}, root = true) {
		return this.Bool('should', obj, root)
	}

	must (obj = {}, root = true) {
		return this.Bool('must', obj, root)
	}

	must_not (obj = {}, root = true) {
		return this.Bool('must_not', obj, root)
	}

	Sibling (address, obj, root = true) {
		return this.chainable(function () {

			if (this.pointer[address] === undefined) {
				this.pointer[address] = clone(obj)
			}

			if (this.isBool(this.address)) {
				var target = this.parent[this.address]
				if (!(target instanceof Array)) {
					this.parent[this.address] = [clone(target)]
				}
				if (target instanceof Array) {
					this.parent[this.address].push(clone({[address]: obj}))
				}

			}

			this.setPointer()
		}, root)
	}

	match (obj, root = true) {
		return this.Sibling('match', obj, root)
	}

	match_all (__null, root = true) {
		return this.Sibling('match', {}, root)
	}

	multi_match (obj, root = true) {
		return this.Sibling('multi_match', obj, root)
	}

	exists (obj, root = true) {
		return this.Sibling('exists', obj, root)
	}

	missing (obj, root = true) {
		return this.Sibling('missing', obj, root)
	}

	term (obj, root = true) {
		return this.Sibling('term', obj, root)
	}

	terms (obj, root = true) {
		return this.Sibling('terms', obj, root)
	}

	range (obj, root = true) {
		return this.Sibling('range', obj, root)
	}

}


var r = new Relastic()
r.filteredQuery().filter().bool().must().term({folder: 'inbox'})
r.filteredQuery().filter().bool().must_not().query().match({email: 'urgent business proposal'})
	// .query()
	// .match({email: 'urgent business proposal'})

// bool.should()
// 	.terms({cheese: ['Rocquefort', 'Cheddar']})


// r.query()

r.print()








function clone (obj) {
	return _.clone(obj, true)
}

function extend (destination, source) {
	return _.extend(destination, source)
}
