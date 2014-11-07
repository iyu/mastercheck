MasterCheck
==========

Consistency check of the master data.
[Japanese document](https://github.com/yuhei-a/wiki/wiki/1.1.x-mastercheck)

## Installation
```
npm install mastercheck
```

## Usage
### Example
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
    // The return err in { collectionName: 'CollectionA', _id: 'A2', key: 'obj.bool', value: 1, message: '1 should be a Boolean' } when it was inconsistent if
});

mastercheck.checkAll(masterData, function(err) {
    // The return err in { collectionName: 'CollectionA', _id: 'A2', key: 'obj.bool', value: 1, message: '1 should be a Boolean' } when it was inconsistent if
});
```

### Example Format Part Option
Specify a function that returns an object or objects.
Function have a parent in the arguments.
#### MasterCheck.Number
```
// For a integer number values of 0-10.
mastercheck.format('Number', {
    required: true, // Existence check. Default do not check.
    min: 0,  // Minimum value check. Default do not check.
    max: 10, // Maximum value check. Default do not check.
    integer: true // Integer check. Default do not check.
});

// For a number of any in [1, 3, 5].
mastercheck.format('Number', {
    required: true, // Existence check. Default do not check.
    select: [ 1, 3, 5 ] // Number match check. Default do not check.
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
mastercheck.format('Boolean', {
    required: true // Existence check. Default do not check.
});
```
#### MasterCheck.Object
```
// For a object. Include { bool: Boolean, num: Number }.
mastercheck.format('Object', {
    required: true // Existance check. Default do not check.
}, {
    bool: new mastercheck.Boolean(),
    num: new mastercheck.Number()
});
```
#### MasterCheck.Array
```
// For a array of 0-20 have length. Includ { bool: Boolean, num: Number }.
mastercheck.format('Array', {
    required: true // Existance check. Default do not check.
    minLength: 0, // Minimum length check. Default do not check.
    maxLength: 20, // Maximum length check. Default do not check.
}, [
    bool: new mastercheck.Boolean(),
    num: new mastercheck.Number()
]);
```
#### MasterCheck.Map
```
// For a object map. Key a string of 1-20 to match /^apple_/. Include { bool: Boolean, num: Number }.
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
