var Relastic = require('./lib')

var r = new Relastic()

// var bool = r.filteredQuery().filter().bool()
// bool
// 	.must()
// 		.term({folder: 'inbox'})
// 		.term({hockey: 'stick'})
// 		.term({sweet: 'NO'})
// 		.terms({cheese: ['cheddar', 'mozarella']})
// 		.bool()
// 			.should()
// 			.term({name: 'HEY'})
// 			.term({hey: 2})
//
// bool.must_not()
// 	.term({folder: 'HEY!'})

r.query().bool()
  .should()
  .match({title: 'brown'})
  .match({title: 'fox'})
  .match({title: 'dog'})
  .minimum_should_match(2)


console.log( JSON.stringify(r.output(), null, 2) )
