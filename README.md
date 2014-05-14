MasterCheck
==========

Consistency check of the master data.

## Installation
```
npm install mastercheck
```

## Usage
### Quick Start
```
var mastercheck = require('mastercheck');

var format = {
    CollectionA: {
        _id: mastercheck.format('String'),
        num: mastercheck.format('Number'),
        obj: {
            bool: mastercheck.format('Boolean'),
        },
        list: [
            {
                num: mastercheck.format('Number')
            }
        ],
        arr: [
            mastercheck.format('Number')
        ],
        map: mastercheck.format('Map', null, {
            name: mastercheck.format('String')
        })
    },
    CollectionB: {}
}

mastercheck.setup(format);

var masterData = {
    CollectionA: [
        { _id: 'A1', num: 0, obj: { bool: true }, list: [ { num: 1 }, { num: 2 } ], arr: [ 1, 2 ], map: { test1: { name: 'test1' }, test2: { name: 'test2' } } },
        { _id: 'A2', num: 0, obj: { bool: 1 }, list: [ { num: 1 }, { num: 2 } ], arr: [ 1, 2 ], map: { test1: { name: 'test1' }, test2: { name: 'test2' } } }
    ],
    CollectionB: [

    ]
};

mastercheck.check('CollectionA', masterData.CollectionA, function(err) {
    // The return err in { collectionName: 'CollectionA', _id: 'A2', key: 'obj.bool', value: 1 } when it was inconsistent if
});

mastercheck.checkAll(masterData, function(err) {
    // The return err in { collectionName: 'CollectionA', _id: 'A2', key: 'obj.bool', value: 1 } when it was inconsistent if
});
```

### Format Part Option
#### MasterCheck.Number
```
// For numeric values of 0-10.
mastercheck.format('Number', {
    required: true, // Existence check. Default do not check.
    min: 0, // Minimum value check. Default do not check.
    max: 10 // Maximum value check. Default do not check.
});
```
#### MasterCheck.String
```
// For a string of 0-20 characters to match /^apple_/.
mastercheck.format('String', {
    required: true, // Existence check. Default do not check.
    minLength: 0, // Minimum number of characters check. Default do not check.
    maxLength: 20, // Maximum number of characters check. Default do not check.
    match: /^apple_/ // String match check. Value to use for the String#match. Default do not check.
});

// For a string of any in ['A', 'B', 'C'].
mastercheck.format('String', {
    required: true, // Existence check. Default do not check.
    select: [ 'A', 'B', 'C' ] // String match check. Default do not check.
});
```
#### MasterCheck.Boolean
```
// For a boolean.
mastercheck.format('Number', {
    required: true // Existence check. Default do not check.
});
```
#### MasterCheck.Object
```
// For a object.
mastercheck.format('Object', {
    required: true // Existance check. Default do not check.
}, {
    bool: new mastercheck.Boolean(),
    num: new mastercheck.Number()
});
```
#### MasterCheck.Map
```
// For a object.
mastercheck.format('Map', {
    maxLength: 20, // Maximum number of characters check. Default do not check.
    match: /^apple_/ // String match check. Value to use for the String#match. Default do not check.
}, {
    bool: new mastercheck.Boolean(),
    num: new mastercheck.Number()
});
```


## Test
Run `npm test` and `npm run-script jshint`
