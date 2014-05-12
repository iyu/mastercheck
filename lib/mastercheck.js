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
 * Generate the format of type Number
 * @param {Object} option
 * @example
 * var option = {
 *     required: true, // Exstence check. 
 *     min: 0, // Minimum value check.
 *     max: 10 // Maximum value check.
 * };
 */
MasterCheck.prototype.Number = function(option) {
    option = option || {};
    this.check = function(data) {
        if (!option.required && typeof data === 'undefined') {
            return true;
        }
        if (typeof data !== 'number') {
            return false;
        }
        if (option.hasOwnProperty('min') && option.min > data) {
            return false;
        }
        if (option.hasOwnProperty('max') && option.max < data) {
            return false;
        }
        return true;
    };
};

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
MasterCheck.prototype.String = function(option) {
    option = option || {};
    this.check = function(data) {
        if (!option.required && typeof data === 'undefined') {
            return true;
        }
        if (typeof data !== 'string') {
            return false;
        }
        if (option.hasOwnProperty('minLength') && option.minLength > data.length) {
            return false;
        }
        if (option.hasOwnProperty('maxLength') && option.maxLength < data.length) {
            return false;
        }
        if (option.hasOwnProperty('match') && !data.match(option.match)) {
            return false;
        }
        if (option.hasOwnProperty('select') && !~option.select.indexOf(data)) {
            return false;
        }
        return true;
    };
};

/**
 * Generate the format of type Boolean
 * @param {Object} option
 * @example
 * var option = {
 *     required: true, // Existence check. Default do not check.
 * };
 */
MasterCheck.prototype.Boolean = function(option) {
    option = option || {};
    this.check = function(data) {
        if (!option.required && typeof data === 'undefined') {
            return true;
        }
        return typeof data === 'boolean';
    };
};

/**
 * Generate the format of type Object
 * @param {Object} option
 * @param {Object|Array} format
 * @example
 * var option = {
 *     required: true, // Existence check. Default do not check.
 * };
 */
MasterCheck.prototype.Object = function(option, format) {
    option = option || {};
    this.check = function(data) {
        if (!option.required && typeof data === 'undefined') {
            return true;
        }
        return typeof data === 'object';
    };
    this.format = format;
};

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
MasterCheck.prototype.Map = function(option, format) {
    option = option || {};
    this.check = function(data) {
        if (typeof data !== 'string') {
            return false;
        }
        if (option.hasOwnProperty('maxLength') && option.maxLength < data.length) {
            return false;
        }
        if (option.hasOwnProperty('match') && !data.match(option.match)) {
            return false;
        }
        if (option.hasOwnProperty('select') && !~option.select.indexOf(data)) {
            return false;
        }
        return true;
    };
    this.format = format;
};

/**
 * Format check
 * @param {Object|Array} format
 * @param {Object|Array} master
 */
MasterCheck.prototype._check = function(format, master) {
    var i, key, _key, err;
    if (Array.isArray(format)) {
        for (i = 0; i < master.length; i++) {
            if (format[0] instanceof MasterCheck.prototype.Number ||
                format[0] instanceof MasterCheck.prototype.String ||
                format[0] instanceof MasterCheck.prototype.Boolean) {
                if (!format[0].check(master[i])) {
                    return { key: i, value: master[i] };
                }
            } else if (format[0] instanceof MasterCheck.prototype.Object) {
                if (!format[0].check(master[i])) {
                    return { key: i, value: master[i] };
                }
                err = this._check(format[0].format, master[i]);
                if (err) {
                    return { key: i + '.' + err.key, value: err.value };
                }
            } else if (typeof format[0] === typeof master[i]) {
                err = this._check(format[0], master[i]);
                if (err) {
                    return { key: i + '.' + err.key, value: err.value };
                }
            } else if (typeof master[i] !== 'undefined') {
                return { key: i, value: JSON.stringify(master[i]) };
            }
        }
    } else {
        for (key in format) {
            if (format[key] instanceof MasterCheck.prototype.Number ||
                format[key] instanceof MasterCheck.prototype.String ||
                format[key] instanceof MasterCheck.prototype.Boolean) {
                if (!format[key].check(master[key])) {
                    return { key: key, value: master[key] };
                }
            } else if (format[key] instanceof MasterCheck.prototype.Object) {
                if (!format[key].check(master[key])) {
                    return { key: key, value: master[key] };
                }
                err = this._check(format[key].format, master[key]);
                if (err) {
                    return { key: key + '.' + err.key, value: err.value };
                }
            } else if (format[key] instanceof MasterCheck.prototype.Map) {
                for (_key in master[key]) {
                    if (!format[key].check(_key)) {
                        return { key: key, value: _key };
                    }
                    err = this._check(format[key].format, master[key][_key]);
                    if (err) {
                        return { key: key + '.' + _key + '.' + err.key, value: err.value };
                    }
                }
            } else if (typeof format[key] === typeof master[key]) {
                err = this._check(format[key], master[key]);
                if (err) {
                    return { key: key + '.' + err.key, value: err.value };
                }
            } else if (typeof master[key] !== 'undefined') {
                return { key: key, value: JSON.stringify(master[key]) };
            }
        }
    }
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
        return callback(); // TODO
    }

    async.eachLimit(dataList, 20, function(_data, next) {
        var err = self._check(format, _data);
        if (err) {
            err.collectionName = key;
            err[self._idAttribute] = _data[self._idAttribute];
            return next(err);
        }
        async.setImmediate(next);
    }, callback);
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
    async.eachSeries(Object.keys(data), function(key, next) {
        self.check(key, data[key], next);
    }, callback);
};
