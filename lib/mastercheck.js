/**
 * @fileOverview mastercheck
 * @name mastercheck.js
 * @author Yuhei Aihara <aihara_yuhei@cyberagent.co.jp>
 * https://github.com/yuhei-a/mastercheck
 */
var async = require('async');

function MasterCheck() {
    // format data.
    this._formatData = {};
    // The default name for id attribute is `"_id"`. Use on error.
    this._idAttribute = '_id';
}

module.exports = new MasterCheck();

/**
 * Setup format data.
 * @param {Object} formatData
 * @param {String} idAttribute
 */
MasterCheck.prototype.setup = function(formatData, idAttribute) {
    this._formatData = formatData || this._formatData;
    this._idAttribute = idAttribute || this._idAttribute;
};

/**
 * format Types
 */
MasterCheck.prototype._formatTypes = {

    /**
     * Generate the format of type Number
     * @param {Object} option
     * @example
     * var option = {
     *     required: true, // Exstence check. 
     *     min: 0, // Minimum value check.
     *     max: 10, // Maximum value check.
     *     integer: true, // Integer check. 
     *     select: [ 1, 3, 7 ], // Select match check. Default do not check.
     * };
     */
    Number: function(option) {
        this.option = option;
        this.check = function(data, parents) {
            var _option = (typeof this.option === 'function' ? this.option(parents) : this.option) || {};
            if (!_option.required && data === undefined) {
                return;
            }
            if (data === undefined) {
                return 'This field is required';
            }
            if (typeof data !== 'number') {
                return data + ' should be a Number';
            }
            if (_option.hasOwnProperty('min') && _option.min > data) {
                return data + ' should be above ' + _option.min;
            }
            if (_option.hasOwnProperty('max') && _option.max < data) {
                return data + ' should be below ' + _option.max;
            }
            if (_option.integer && data % 1 !== 0) {
                return data + ' should be integer';
            }
            if (_option.hasOwnProperty('select') && !~_option.select.indexOf(data)) {
                return data + ' should match ' + _option.select.join(' or ');
            }
        };
    },

    /**
     * Generate the format of type String
     * @param {Object} option
     * @example
     * var option = {
     *     required: true, // Existence check. Default do not check.
     *     minLength: 0, // Minimum number of characters check. Default do not check.
     *     maxLength: 20, // Maximum number of characters check. Default do not check.
     *     match: /^apple_/, // String match check. Value to use for the String#match. Default do not check.
     *     select: [ 'apple_a1', 'apple_b2', 'apple_c3' ], // Select match check. Default do not check.
     * };
     */
    String: function(option) {
        this.option = option;
        this.check = function(data, parents) {
            var _option = (typeof this.option === 'function' ? this.option(parents) : this.option) || {};
            if (!_option.required && data === undefined) {
                return;
            }
            if (data === undefined) {
                return 'This field is required';
            }
            if (typeof data !== 'string') {
                return data + ' should be a String';
            }
            if (_option.hasOwnProperty('minLength') && _option.minLength > data.length) {
                return data + ' length should be above ' + _option.minLength;
            }
            if (_option.hasOwnProperty('maxLength') && _option.maxLength < data.length) {
                return data + ' length should be below ' + _option.maxLength;
            }
            if (_option.hasOwnProperty('match') && !data.match(_option.match)) {
                return data + ' should match ' + _option.match;
            }
            if (_option.hasOwnProperty('select') && !~_option.select.indexOf(data)) {
                return data + ' should match ' + _option.select.join(' or ');
            }
        };
    },

    /**
     * Generate the format of type Boolean
     * @param {Object} option
     * @example
     * var option = {
     *     required: true, // Existence check. Default do not check.
     * };
     */
    Boolean: function(option) {
        this.option = option;
        this.check = function(data, parents) {
            var _option = (typeof this.option === 'function' ? this.option(parents) : this.option) || {};
            if (!_option.required && data === undefined) {
                return;
            }
            if (data === undefined) {
                return 'This field is required';
            }
            if (typeof data !== 'boolean') {
                return data + ' should be a Boolean';
            }
        };
    },

    /**
     * Generate the format of type Object
     * @param {Object} option
     * @param {Object|Array} format
     * @example
     * var option = {
     *     required: true, // Existence check. Default do not check.
     * };
     */
    Object: function(option, format) {
        this.option = option;
        this.check = function(data, parents) {
            var _option = (typeof this.option === 'function' ? this.option(parents) : this.option) || {};
            if (!_option.required && data === undefined) {
                return;
            }
            if (data === undefined) {
                return 'This field is required';
            }
            if (typeof data !== 'object') {
                return data + ' should be an Object';
            }
        };
        this.format = format;
    },

    /**
     * Generate the format of type ObjectArray
     * @param {Object} option
     * @param {Array} format
     * @example
     * var option = {
     *     required: true, // Existence check. Default do not check.
     *     minLength: 0, // Minimum length check. Default do not check.
     *     maxLength: 20, // Maximum length check. Default do not check.
     * };
     */
    Array: function(option, format) {
        this.option = option;
        this.check = function(data, parents) {
            var _option = (typeof this.option === 'function' ? this.option(parents) : this.option) || {};
            if (!_option.required && data === undefined) {
                return;
            }
            if (data === undefined) {
                return 'This field is required';
            }
            if (!Array.isArray(data)) {
                return data + ' should be an Array';
            }
            if (_option.hasOwnProperty('minLength') && _option.minLength > data.length) {
                return data + ' length should be above ' + _option.minLength;
            }
            if (_option.hasOwnProperty('maxLength') && _option.maxLength < data.length) {
                return data + ' length should be below ' + _option.maxLength;
            }
        };
        this.format = format;
    },

    /**
     * Generate the format of type ObjectMap
     * @param {Object} option
     * @param {Object|Array} format
     * @example
     * var option = {
     *     maxLength: 20, // Maximum number of characters check. Default do not check.
     *     match: /^apple_/, // String match check. Value to use for the String#match. Default do not check.
     * };
     */
    Map: function(option, format) {
        this.option = option;
        this.check = function(data, parents) {
            var _option = (typeof this.option === 'function' ? this.option(parents) : this.option) || {};
            if (_option.hasOwnProperty('maxLength') && _option.maxLength < data.length) {
                return data + ' length should be above ' + _option.maxLength;
            }
            if (_option.hasOwnProperty('match') && !data.match(_option.match)) {
                return data + ' should match ' + _option.match;
            }
            if (_option.hasOwnProperty('select') && !~_option.select.indexOf(data)) {
                return data + ' should match ' + _option.select;
            }
        };
        this.format = format;
    }
};

/**
 * Generater the format instance
 * @param {String} type
 * @param {Object} option
 * @param {Object|Array} format
 */
MasterCheck.prototype.format = function(type, option, format) {
    var Format = this._formatTypes[type];
    if (!Format) {
        return;
    }
    return new Format(option, format);
};

/**
 * Format check
 * @param {Object|Array} format
 * @param {Object|Array} master
 * @param {Array} parents
 */
MasterCheck.prototype._check = function(format, master, parents) {
    parents = parents || [];
    var errs = [];
    var key, i, _key, err, _errs, _format, _master, _parents;
    var isArrayFormat = Array.isArray(format);
    for (key in isArrayFormat ? master : format) {
        _format = isArrayFormat ? format[0] : format[key];
        _master = master[key];
        _parents = [ { parent: master, key: key } ].concat(parents);
        if (_format instanceof this._formatTypes.Number ||
            _format instanceof this._formatTypes.String ||
            _format instanceof this._formatTypes.Boolean) {
            err = _format.check(_master, _parents);
            if (err) {
                errs.push({ key: key, value: _master, message: err });
            }
        } else if (_format instanceof this._formatTypes.Object) {
            err = _format.check(_master, _parents);
            if (err) {
                errs.push({ key: key, value: _master, message: err });
                continue;
            }
            _errs = this._check(_format.format, _master, _parents);
            for (i = 0; i < _errs.length; i++) {
                errs.push({ key: key + '.' + _errs[i].key, value: _errs[i].value, message: _errs[i].message });
            }
        } else if (_format instanceof this._formatTypes.Map) {
            for (_key in _master) {
                err = _format.check(_key, _parents);
                if (err) {
                    errs.push({ key: key, value: _key, message: err });
                    continue;
                }
                _errs = this._check(_format.format, _master[_key], _parents);
                for (i = 0; i < _errs.length; i++) {
                    errs.push({ key: key + '.' + _key + '.' + _errs[i].key, value: _errs[i].value, message: _errs[i].message });
                }
            }
        } else if (typeof _format === typeof _master && Array.isArray(_format) === Array.isArray(_master)) {
            _errs = this._check(_format, _master, _parents);
            for (i = 0; i< _errs.length; i++) {
                errs.push({ key: key + '.' + _errs[i].key, value: _errs[i].value, message: _errs[i].message });
            }
        } else if (typeof _master !== 'undefined') {
            errs.push({ key: key, value: JSON.stringify(_master), message: 'Format Error.' });
        }
    }

    return errs;
};

/**
 * Format check.
 * @param {String} key
 * @param {Array} dataList
 * @param {Function} callback
 * @example
 * var key = 'collectionNameA';
 * var dataList = [ {data}, {data},, ]
 */
MasterCheck.prototype.check = function(key, dataList, callback) {
    var self = this;
    var format = this._formatData[key];
    if (!format) {
        return callback();
    }

    var result = {};
    async.eachLimit(dataList, 20, function(_data, next) {
        var errs = self._check(format, _data);
        if (errs.length) {
            result[_data[self._idAttribute]] = errs;
        }
        async.setImmediate(next);
    }, function(err) {
        callback(err, result);
    });
};

/**
 * Format check all.
 * @param {Object} data
 * @param {Function} callback
 * @example
 * var data = {
 *     collectionNameA: dataList,
 *     collectionNameB: dataList,
 * };
 */
MasterCheck.prototype.checkAll = function(data, callback) {
    var self = this;
    var result = {};
    async.eachSeries(Object.keys(data), function(key, next) {
        self.check(key, data[key], function(err, _result) {
            if (err) {
                return next(err);
            }
            result[key] = _result;
            next();
        });
    }, function(err) {
        callback(err, result);
    });
};
