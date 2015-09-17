import Relastic from '../../src'
let r = new Relastic()

r.filteredQuery()
	.query()
	.match_all()

r.filteredQuery()
	.filter()
	.term({price: 20})


export default r
