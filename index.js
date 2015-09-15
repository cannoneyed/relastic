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

	print () {
		console.log(JSON.stringify(this.composition, null, 2))
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

	same (root) {
		return this.chainable(function () {
			this.setPointer()
		}, root)
	}







	filteredQuery (__null, root = true) {
		if (this.address === 'filtered') {
			return this.same(root)
		}

		return this.chainable(function () {
			if (this.pointer.filtered === undefined) {
				this.pointer.filtered = {
					query: {},
					filter: {},
				}
			}
			this.setPointer('filtered')
		}, root)
	}

	query (queryObj, root = true) {
		if (this.address === 'query') {
			return this.same(root)
		}

		return this.chainable(function () {
			if (this.pointer.query === undefined) {
				this.pointer.query = clone(queryObj)
			}
			this.setPointer('query')
		}, root)
	}

	filter (__null, root = true) {
		if (this.address === 'filter') {
			return this.same(root)
		}

		return this.chainable(function () {
			if (this.pointer.filter === undefined) {
				this.pointer.filter = clone(q)
			}
			this.setPointer('filter')
		}, root)
	}





	match (queryObj, root = true) {
		return this.chainable(function () {
			if (this.pointer.match === undefined) {
				this.pointer.match = clone(queryObj)
			} else {
				this.pointer.match = extend(this.pointer.match, queryObj)
			}
			this.setPointer()
		}, root)
	}



	term (queryObj, root = true) {
		return this.chainable(function () {
			if (this.pointer.term === undefined) {
				this.pointer.term = clone(queryObj)
			} else {
				this.pointer.term = extend(this.pointer.term, queryObj)
			}
			this.setPointer()
		}, root)
	}

	terms (queryObj, root = true) {
		return this.chainable(function () {
			if (this.pointer.terms === undefined) {
				this.pointer.terms = clone(queryObj)
			} else {
				this.pointer.terms = extend(this.pointer.terms, queryObj)
			}
			this.setPointer()
		}, root)
	}

	range (queryObj, root = true) {
		return this.chainable(function () {
			if (this.pointer.range === undefined) {
				this.pointer.range = clone(queryObj)
			} else {
				this.pointer.range = extend(this.pointer.range, queryObj)
			}
			this.setPointer()
		}, root)
	}

}


var r = new Relastic ()
r.filteredQuery().filter()
	.term({firstName: 'Andy'})
	.range({age: {gte: 1, lte: 29}})

// r.query()
// 	.match({name: 'Andy'})

r.print()








function clone (obj) {
	return _.clone(obj, true)
}

function extend (destination, source) {
	return _.extend(destination, source)
}
