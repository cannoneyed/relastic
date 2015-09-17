# Relastic
Simple Elasticsearch query builder

## Installation
```bash
$ npm install relastic
```

## Usage
Relastic uses method chaining to construct Elasticsearch queries.

```javascript
var Relastic = require('relastic')
var r = new Relastic()

r.query().match({title: 'thai chili'})
r.output()
// {
//   query: {
//     match: {
//       title: 'thai chilies'
//     }
//   }
// }
```

This approach can be much simpler than constructing large ES queries when compared to explicitly defining and modifying complex objects.

```javascript
r.filter()
  .bool()
  .must()
    .term({type: 'chili pepper'})
    .terms({spiciness: ['high', 'very high']})
  .should()
    .term({color: 'green'})
    .term({size: 'small'})

r.output()
// {
//   query: {},
//   filter: {
//     bool: {
//       must: [
//         {
//           term: {
//             type: 'chili pepper'
//           }
//         },
//         {
//           terms: {
//             spiciness: ['high', 'very high']}
//           }
//         }
//       ],
//       should: [
//         {
//           term: {
//             color: 'green'
//           }
//         },
//         {
//           term: {
//             size: 'small'
//           }
//         }
//       ]
//     }
//   }
// }
```

Relastic also allows construction of query objects progressively.

```javascript
r.filteredQuery()
  .query()
  .match({ingredients: 'cayenne'})

r.filteredQuery()
  .filter()
  .term({type: 'soup'})

r.output()
// {
//   query: {
//     filtered: {
//       query: {
//         match: {
//           ingredients: 'cayenne'
//         }
//       },
//       filter: {
//         term: {
//           type: 'soup'
//         }
//       }
//     }
//   }
// }
```

Each invocation of a Relastic query constructor method returns a chainable instance of Relastic. The chain can be started anew at whatever point the final method invocation referred to.

```javascript
var bool = r.filter().bool()

bool.must().term({color: 'green'})
bool.must_not().terms({spiciness: ['none', 'low', 'medium']})
r.output()
// {
//   query: {},
//   filter: {
//     bool : {
//       must: {
//         term: {
//           color: 'green'
//         }
//       },
//       must_not: {
//         terms: {
//           spiciness: ['none', 'low', 'medium']
//         }
//       }
//     }
//   }
// }
```
