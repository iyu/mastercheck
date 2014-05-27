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

var formatTypes = {

    /**
     * Generate the format of type Number
     * @param {Object} option
     * @example
     * var option = {
     *     required: true, // Exstence check. 
     *     min: 0, // Minimum value check.
     *     max: 10 // Maximum value check.
     * };
     */
    Number: function(option) {
        option = option || {};
        this.check = function(data) {
            if (!option.required && data === undefined) {
                return;
            }
            if (data === undefined) {
                return 'This field is required';
            }
            if (typeof data !== 'number') {
                return data + ' should be a Number';
            }
            if (option.hasOwnProperty('min') && option.min > data) {
                return data + ' should be above ' + option.min;
            }
            if (option.hasOwnProperty('max') && option.max < data) {
                return data + ' should be below ' + option.max;
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
     * };
     */
    String: function(option) {
        option = option || {};
        this.check = function(data) {
            if (!option.required && data === undefined) {
                return;
            }
            if (data === undefined) {
                return 'This field is required';
            }
            if (typeof data !== 'string') {
                return data + ' should be a String';
            }
            if (option.hasOwnProperty('minLength') && option.minLength > data.length) {
                return data + ' length should be above ' + option.minLength;
            }
            if (option.hasOwnProperty('maxLength') && option.maxLength < data.length) {
                return data + ' length should be below ' + option.maxLength;
            }
            if (option.hasOwnProperty('match') && !data.match(option.match)) {
                return data + ' should match ' + option.match;
            }
            if (option.hasOwnProperty('select') && !~option.select.indexOf(data)) {
                return data + ' should match ' + option.select.join(' or ');
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
        option = option || {};
        this.check = function(data) {
            if (!option.required && data === undefined) {
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
        option = option || {};
        this.check = function(data) {
            if (!option.required && data === undefined) {
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
        option = option || {};
        this.check = function(data) {
            if (!option.required && data === undefined) {
                return;
            }
            if (data === undefined) {
                return 'This field is required';
            }
            if (!Array.isArray(data)) {
                return data + ' should be an Array';
            }
            if (option.hasOwnProperty('minLength') && option.minLength > data.length) {
                return data + ' length should be above ' + option.minLength;
            }
            if (option.hasOwnProperty('maxLength') && option.maxLength < data.length) {
                return data + ' length should be below ' + option.maxLength;
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
        option = option || {};
        this.check = function(data) {
            if (option.hasOwnProperty('maxLength') && option.maxLength < data.length) {
                return data + ' length should be above ' + option.maxLength;
            }
            if (option.hasOwnProperty('match') && !data.match(option.match)) {
                return data + ' should match ' + option.match;
            }
            if (option.hasOwnProperty('select') && !~option.select.indexOf(data)) {
                return data + ' should match ' + option.select;
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
    var Format = formatTypes[type];
    if (!Format) {
        return;
    }
    return new Format(option, format);
};

/**
 * Format check
 * @param {Object|Array} format
 * @param {Object|Array} master
 */
MasterCheck.prototype._check = function(format, master) {
    var errs = [];
    var i, j, key, _key, _errs, err;
    if (Array.isArray(format)) {
        for (i = 0; i < master.length; i++) {
            if (format[0] instanceof formatTypes.Number ||
                format[0] instanceof formatTypes.String ||
                format[0] instanceof formatTypes.Boolean) {
                err = format[0].check(master[i]);
                if (err) {
                    errs.push({ key: i, value: master[i], message: err });
                }
            } else if (format[0] instanceof formatTypes.Object) {
                err = format[0].check(master[i]);
                if (err) {
                    errs.push({ key: i, value: master[i], message: err });
                    continue;
                }
                _errs = this._check(format[0].format, master[i]);
                for (j = 0; j < _errs.length; j++) {
                    errs.push({ key: i + '.' + _errs[j].key, value: _errs[j].value, message: _errs[j].message });
                }
            } else if (typeof format[0] === typeof master[i] && Array.isArray(format[0]) === Array.isArray(master[i])) {
                _errs = this._check(format[0], master[i]);
                for (j = 0; j < _errs.length; j++) {
                    errs.push({ key: i + '.' + _errs[j].key, value: _errs[j].value, message: _errs[j].message });
                }
            } else if (typeof master[i] !== 'undefined') {
                errs.push({ key: i, value: JSON.stringify(master[i]), message: 'Format Error.' });
            }
        }
    } else {
        for (key in format) {
            if (format[key] instanceof formatTypes.Number ||
                format[key] instanceof formatTypes.String ||
                format[key] instanceof formatTypes.Boolean) {
                err = format[key].check(master[key]);
                if (err) {
                    errs.push({ key: key, value: master[key], message: err });
                }
            } else if (format[key] instanceof formatTypes.Object) {
                err = format[key].check(master[key]);
                if (err) {
                    errs.push({ key: key, value: master[key], message: err });
                    continue;
                }
                _errs = this._check(format[key].format, master[key]);
                for (i = 0; i < _errs.length; i++) {
                    errs.push({ key: key + '.' + _errs[i].key, value: _errs[i].value, message: _errs[i].message });
                }
            } else if (format[key] instanceof formatTypes.Map) {
                for (_key in master[key]) {
                    err = format[key].check(_key);
                    if (err) {
                        errs.push({ key: key, value: _key, message: err });
                        continue;
                    }
                    _errs = this._check(format[key].format, master[key][_key]);
                    for (i = 0; i < _errs.length; i++) {
                        errs.push({ key: key + '.' + _key + '.' + _errs[i].key, value: _errs[i].value, message: _errs[i].message });
                    }
                }
            } else if (typeof format[key] === typeof master[key] && Array.isArray(format[key]) === Array.isArray(master[key])) {
                _errs = this._check(format[key], master[key]);
                for (i = 0; i< _errs.length; i++) {
                    errs.push({ key: key + '.' + _errs[i].key, value: _errs[i].value, message: _errs[i].message });
                }
            } else if (typeof master[key] !== 'undefined') {
                errs.push({ key: key, value: JSON.stringify(master[key]), message: 'Format Error.' });
            }
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
