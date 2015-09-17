import fs from 'fs'
import test from 'tape'

fs.readdir(__dirname + '/tests', (err, files) => {
	test('Test all the queries...', (t) => {
		t.plan(files.length)
		files.forEach(filename => runTest(filename, t))
	})
})

function runTest (filename, t) {
	let fileDigits = filename.split('.')[0]
 	let intendedOutput = require('./test-data/' + fileDigits + '.json')
	let testFunction = require('./tests/' + fileDigits + '.js')

	t.deepEqual(intendedOutput, testFunction.output())
}
