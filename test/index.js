var should = require('should');

var masterCheck = require('../');

describe('MasterCheck test', function() {
    before(function(done) {
        var format = {
            A: {
                _id: masterCheck.format('String', { required: true }),
                num: masterCheck.format('Number', { min: 0, max: 100 }),
                obj: {
                    code: masterCheck.format('String', { minLength: 1, maxLength: 10 }),
                    type: masterCheck.format('String', { select: [ 'Dog', 'Cat' ] }),
                    bool: masterCheck.format('Boolean')
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
                })
            }
        };
        masterCheck.setup(format);
        done();
    });

    it('basic test.', function(done) {
        var dataList = [
            {
                _id: 'test1',
                num: 1,
                obj: {
                    code: 'test1_1',
                    bool: true
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
                result.should.eql({ test2: [ { key: 'num', value: -1 } ] });
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
                result.should.eql({ test2: [ { key: 'num', value: 101 } ] });
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
                result.should.eql({ test2: [ { key: 'obj.code', value: '' } ] });
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
                result.should.eql({ test2: [ { key: 'obj.code', value: '12345678901' } ] });
                done();
            });
        });

        it('String match check test. select', function(done) {
            var dataList = [
                {
                    _id: 'test1',
                    obj: {
                        type: 'Dog'
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
                result.should.eql({ test2: [ { key: 'obj.type', value: 'Rabbit' } ] });
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
                result.should.eql({ test2: [ { key: 'list.0.code', value: 'dev' } ] });
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
                result.should.eql({ test2: [ { key: 'obj.bool', value: 'true' } ] });
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
                result.should.eql({ test2: [ { key: 'arr', value: undefined } ] });
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
                result.should.eql({ test2: [ { key: 'map', value: 'aaaa' } ] });
                done();
            });
        });
    });
});
