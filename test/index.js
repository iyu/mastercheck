var should = require('should');

var masterCheck = require('../');

describe('MasterCheck test', function() {
    before(function(done) {
        var format = {
            A: {
                _id: masterCheck.format('String', { required: true }),
                num: masterCheck.format('Number', { min: 0, max: 100, integer: true }),
                obj: {
                    code: masterCheck.format('String', { minLength: 1, maxLength: 10, existIn: 'B' }),
                    type: masterCheck.format('String', { select: [ 'Dog', 'Cat' ] }),
                    bool: masterCheck.format('Boolean', function(parents) {
                        if (parents[0].type === 'Dog') {
                            return { required: true };
                        }
                    })
                },
                list: [
                    {
                        code: masterCheck.format('String', { match: /^test/ })
                    }
                ],
                arr: masterCheck.format('Object', { required: true }, [
                    masterCheck.format('Number')
                ]),
                map: masterCheck.format('Map', { match: /^test/ }, {
                    name: masterCheck.format('String')
                }),
                map2: masterCheck.format('Map', null, masterCheck.format('Number'))
            }
        };
        masterCheck.setup(format, '_id', { B: [ 'test1_1', 'test2_1' ] });
        done();
    });

    it('basic test.', function(done) {
        var dataList = [
            {
                _id: 'test1',
                num: 1,
                obj: {
                    code: 'test1_1',
                },
                list: [
                    { code: 'test1_1_1' },
                    { code: 'test1_1_2' }
                ],
                arr: [ 1, 2 ]
            },
            {
                _id: 'test2',
                num: 2,
                obj: {
                    code: 'test2_1',
                    type: 'Dog',
                    bool: false
                },
                list: [
                    { code: 'test2_1_1' },
                    { code: 'test2_1_2' }
                ],
                arr: [ 3, 4 ]
            }
        ];
        masterCheck.check('A', dataList, function(err, result) {
            should.not.exist(err);
            should.exist(result);
            Object.keys(result).should.have.length(0);
            done();
        });
    });


    describe('Number', function() {
        it('Minimum value check test.', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    num: 10,
                    arr: [ 1, 2 ]
                },
                {
                    _id: 'test2',
                    num: -1,
                    arr: [ 3, 4 ]
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'num', value: -1, message: '-1 should be above 0' } ] });
                done();
            });
        });

        it('Maximum value check test.', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    num: 10,
                    arr: [ 1, 2 ]
                },
                {
                    _id: 'test2',
                    num: 101,
                    arr: [ 3, 4 ]
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'num', value: 101, message: '101 should be below 100' } ] });
                done();
            });
        });

        it('Integer check test.', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    num: 10,
                    arr: [ 1, 2 ]
                },
                {
                    _id: 'test2',
                    num: 10.1,
                    arr: [ 3, 4 ]
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'num', value: 10.1, message: '10.1 should be integer' } ] });
                done();
            });
        });
    });

    describe('String', function() {
        it('Minimum number of characters check test.', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    obj: {
                        code: 'test1_1'
                    },
                    arr: [ 1, 2 ]
                },
                {
                    _id: 'test2',
                    obj: {
                        code: ''
                    },
                    arr: [ 3, 4 ]
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'obj.code', value: '', message: ' length should be above 1' } ] });
                done();
            });
        });

        it('Maximum number of characters check test.', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    obj: {
                        code: 'test1_1'
                    },
                    arr: [ 1, 2 ]
                },
                {
                    _id: 'test2',
                    obj: {
                        code: '12345678901'
                    },
                    arr: [ 3, 4 ]
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'obj.code', value: '12345678901', message: '12345678901 length should be below 10' } ] });
                done();
            });
        });

        it('String match check test. select', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    obj: {
                        type: 'Dog',
                        bool: false
                    },
                    arr: [ 1, 2 ]
                },
                {
                    _id: 'test2',
                    obj: {
                        type: 'Rabbit'
                    },
                    arr: [ 3, 4 ]
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'obj.type', value: 'Rabbit', message: 'Rabbit should match Dog or Cat' } ] });
                done();
            });
        });

        it('String match check test. match', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    list: [
                        { code: 'test1_1' }
                    ],
                    arr: [ 1, 2 ]
                },
                {
                    _id: 'test2',
                    list: [
                        { code: 'dev' }
                    ],
                    arr: [ 3, 4 ]
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'list.0.code', value: 'dev', message: 'dev should match /^test/' } ] });
                done();
            });
        });

        it('Exist in keyMap check test.', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    obj: {
                        code: 'test1_1'
                    },
                    arr: []
                },
                {
                    _id: 'test2',
                    obj: {
                        code: 'test2_2'
                    },
                    arr: []
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'obj.code', value: 'test2_2', message: 'test2_2 should be exist in B' } ] });
                done();
            });
        });
    });

    describe('Boolean', function() {
        it('basic test', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    obj: {
                        bool: true
                    },
                    arr: [ 1, 2 ]
                },
                {
                    _id: 'test2',
                    obj: {
                        bool: 'true'
                    },
                    arr: [ 3, 4 ]
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'obj.bool', value: 'true', message: 'true should be a Boolean' } ] });
                done();
            });
        });
    });

    describe('Object', function() {
        it('Existence check test.', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    arr: [ 1, 2 ]
                },
                {
                    _id: 'test2',
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'arr', value: undefined, message: 'This field is required' } ] });
                done();
            });
        });
    });

    describe('Map', function() {
        it('Existence check test.', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    arr: [ 1, 2 ],
                    map: {
                        test01: {
                            name: 'test01',
                        },
                    },
                },
                {
                    _id: 'test2',
                    arr: [ 3, 4 ],
                    map: {
                        test01: {},
                        aaaa: {},
                    },
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'map', value: 'aaaa', message: 'aaaa should match /^test/' } ] });
                done();
            });
        });

        it('Simple check test.', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    arr: [ 1, 2 ],
                    map2: {
                        a: 1,
                        b: 2,
                        c: 3
                    }
                },
                {
                    _id: 'test2',
                    arr: [ 3, 4 ],
                    map2: {
                        d: 4,
                        e: '5',
                        f: 6
                    }
                }
            ];
            masterCheck.check('A', dataList, function(err, result) {
                should.not.exist(err);
                should.exist(result);
                result.should.eql({ test2: [ { key: 'map2.e', value: '5', message: '5 should be a Number' } ] });
                done();
            });
        });
    });
});
