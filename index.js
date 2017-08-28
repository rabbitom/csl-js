"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CSLUtility = function () {
    function CSLUtility() {
        _classCallCheck(this, CSLUtility);
    }

    _createClass(CSLUtility, null, [{
        key: "toIntLE",
        value: function toIntLE(buffer, offset, length) {
            var array = new Uint8Array(buffer);
            if (offset === undefined) offset = 0;
            if (length === undefined) length = array.length - offset;
            var result = 0;
            for (var i = length - 1; i >= 0; i--) {
                result = result * 0x100 + array[offset + i];
            }
            return result;
        }
    }, {
        key: "writeIntLE",
        value: function writeIntLE(value, array, offset, length) {
            for (var i = 0; i < length; i++) {
                array[offset + i] = value >> 8 * i & 0xff;
            }
        }
    }, {
        key: "toIntBE",
        value: function toIntBE(buffer, offset, length) {
            var array = new Uint8Array(buffer);
            if (offset === undefined) offset = 0;
            if (length === undefined) length = array.length - offset;
            var result = 0;
            for (var i = 0; i < length; i++) {
                result = result * 0x100 + array[offset + i];
            }
            return result;
        }
    }, {
        key: "writeIntBE",
        value: function writeIntBE(value, array, offset, length) {
            for (var i = 0; i < length; i++) {
                array[offset + (length - 1 - i)] = value >> 8 * i & 0xff;
            }
        }
    }, {
        key: "toHexString",
        value: function toHexString(buffer, offset, length, glue) {
            var array = new Uint8Array(buffer);
            if (offset === undefined) offset = 0;
            if (length === undefined) length = array.length - offset;
            var chars = [];
            for (var i = 0; i < length; i++) {
                var n = array[offset + i];
                var char = n.toString(16).toUpperCase();
                if (n < 16) char = "0" + char;
                chars.push(char);
            }
            return chars.join(glue);
        }
    }, {
        key: "arrayFromHexString",
        value: function arrayFromHexString(str) {
            var strLength = str.length;
            var maxLength = (strLength + 1) / 2;
            var array = new Uint8Array(maxLength);
            var arrayIndex = 0;
            var previousN = NaN;
            for (var i = 0; i < strLength; i++) {
                var char = str.slice(i, i + 1);
                var n = parseInt(char, 16);
                if (!isNaN(previousN)) {
                    if (isNaN(n)) array[arrayIndex++] = previousN;else array[arrayIndex++] = previousN * 0x10 + n;
                    previousN = NaN;
                } else previousN = n;
            }
            if (!isNaN(previousN)) array[arrayIndex++] = previousN;
            return array.subarray(0, arrayIndex);
        }
    }, {
        key: "arrayFromString",
        value: function arrayFromString(str) {
            var n = str.length,
                idx = 0,
                utf8 = new Uint8Array(new ArrayBuffer(n * 4)),
                i,
                j,
                c;

            for (i = 0; i < n; ++i) {
                c = str.charCodeAt(i);
                if (c <= 0x7F) {
                    utf8[idx++] = c;
                } else if (c <= 0x7FF) {
                    utf8[idx++] = 0xC0 | c >>> 6;
                    utf8[idx++] = 0x80 | c & 0x3F;
                } else if (c <= 0xFFFF) {
                    utf8[idx++] = 0xE0 | c >>> 12;
                    utf8[idx++] = 0x80 | c >>> 6 & 0x3F;
                    utf8[idx++] = 0x80 | c & 0x3F;
                } else {
                    j = 4;
                    while (c >> 6 * j) {
                        j++;
                    }utf8[idx++] = 0xFF00 >>> j & 0xFF | c >>> 6 * --j;
                    while (j--) {
                        utf8[idx++] = 0x80 | c >>> 6 * j & 0x3F;
                    }
                }
            }
            return utf8.subarray(0, idx);
        }
    }, {
        key: "toString",
        value: function toString(buffer, offset, length) {
            var array = new Uint8Array(buffer);
            if (offset === undefined) offset = 0;
            var end;
            if (length !== undefined) end = offset + length + 1;else {
                end = array.indexOf(0, offset);
                if (end == 0) return '';else if (end == -1) end = array.length;
            }
            var arr = end > 0 ? array.slice(offset, end) : array;
            var encodedString = String.fromCharCode.apply(null, arr),
                decodedString = decodeURIComponent(escape(encodedString));
            return decodedString;
        }
    }]);

    return CSLUtility;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CSLMessage = function () {
    function CSLMessage(pattern) {
        _classCallCheck(this, CSLMessage);

        var fields = new Object();
        var templates = new Object();
        var addField = function addField(field) {
            if (field.id) fields[field.id] = field;
            if (field['as-template']) templates[field['as-template']] = field;
            if (field.type == 'combination' || field.type == 'array') {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = field.value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var subField = _step.value;

                        addField(subField);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        };
        if (pattern instanceof Array) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = pattern[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var field = _step2.value;

                    addField(field);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            this.defaultField = pattern[0];
        } else {
            this.defaultField = pattern;
            addField(pattern);
        }
        this.fields = fields;
        this.templates = templates;
    }

    _createClass(CSLMessage, [{
        key: 'encode',
        value: function encode(object, fieldId) {
            var field = this.defaultField;
            if (fieldId !== undefined) field = this.fields[fieldId];
            if (field == null) throw "no field to encode: " + fieldId;
            return this.encodeField(object, field);
        }
    }, {
        key: 'encodeField',
        value: function encodeField(object, field) {
            if (field.template) {
                var template = this.templates[field.template];
                if (template === undefined) throw "no template found: " + field.template;
                for (var key in template) {
                    if (key != 'id' && key != 'as-template' && field[key] === undefined) field[key] = template[key];
                }
                field.template = null;
            }
            var value;
            if (object != null) value = field.name === undefined ? object : object[field.name];
            switch (field.type) {
                case 'fixed':
                    return this.encodeValue(field.length, field.format, field.value);
                case 'variable':
                    return this.encodeValue(field.length, field.format, value);
                case 'index':
                    {
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = field.value[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var item = _step3.value;

                                if (item.value == value) return this.encode(object, item.id);
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        throw "value not found in index: " + value;
                    }
                case 'combination':
                    {
                        var array = new Uint8Array(field.length);
                        var offset = 0;
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = field.value[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var iField = _step4.value;

                                var iArray = this.encodeField(value, iField);
                                array.set(iArray, offset);
                                offset += iArray.length;
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }

                        return array;
                    }
                case 'array':
                    {
                        if (!(value instanceof Array)) throw "could not encode as array: " + JSON.stringify(value);
                        var array = new Uint8Array(field.length);
                        var offset = 0;
                        var itemField = field.value[0];
                        for (var i = 0; i < value.length; i++) {
                            var itemArray = this.encodeField(value[i], itemField);
                            if (offset + itemArray.length > field.length) throw 'array is too short';
                            array.set(itemArray, offset);
                            offset += itemArray.length;
                        }
                        return array;
                    }
            }
        }
    }, {
        key: 'encodeValue',
        value: function encodeValue(length, format, value) {
            var array = new Uint8Array(length);
            switch (format) {
                case 'int':
                case 'int.le':
                    CSLUtility.writeIntLE(value, array, 0, length);
                    break;
                case 'int.be':
                    CSLUtility.writeIntBE(value, array, 0, length);
                    break;
                case 'string':
                    var arrayFromString = CSLUtility.arrayFromString(value);
                    for (var i = 0; i < length; i++) {
                        if (i < arrayFromString.length) array[i] = arrayFromString[i];else array[i] = 0;
                    }
                    break;
                case 'bcd':
                    var valueBelowHundred = value % 100;
                    var valueOfTens = Math.floor(valueBelowHundred / 10);
                    var valueOfOnes = valueBelowHundred % 10;
                    array[0] = valueOfTens * 0x10 + valueOfOnes;
                    break;
            }
            return array;
        }
    }, {
        key: 'decode',
        value: function decode(buffer, offset, length, fieldId) {
            var field = this.defaultField;
            if (fieldId !== undefined) field = this.fields[fieldId];
            if (field == null) throw "no field to decode: " + fieldId;
            return this.decodeField(buffer, offset, length, field);
        }
    }, {
        key: 'decodeField',
        value: function decodeField(buffer, offset, length, field) {
            if (offset === undefined) offset = 0;
            if (length !== undefined && length < field.length) throw "length too short for field";
            var result;
            switch (field.type) {
                case 'index':
                case 'fixed':
                case 'variable':
                    {
                        var value = this.decodeValue(buffer, offset, field.length, field.format);
                        if (field.type == 'fixed' && value != field.value[0]) throw "value mismatch for fixed field";
                        if (field.type == 'index') {
                            var _iteratorNormalCompletion5 = true;
                            var _didIteratorError5 = false;
                            var _iteratorError5 = undefined;

                            try {
                                for (var _iterator5 = field.value[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                    var item = _step5.value;

                                    if (item.value == value) return this.decode(buffer, offset, length, item.id);
                                }
                            } catch (err) {
                                _didIteratorError5 = true;
                                _iteratorError5 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                                        _iterator5.return();
                                    }
                                } finally {
                                    if (_didIteratorError5) {
                                        throw _iteratorError5;
                                    }
                                }
                            }

                            if (result === undefined) throw "value mismatch for index field";
                        } else result = value;
                        break;
                    }
                case 'combination':
                    {
                        var object = new Object();
                        var iOffset = offset;
                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            for (var _iterator6 = field.value[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var iField = _step6.value;

                                var iObject = this.decodeField(buffer, iOffset, iField.length, iField);
                                if (iObject === undefined) throw "decode combination field failed";
                                iOffset += iField.length;
                                for (var key in iObject) {
                                    object[key] = iObject[key];
                                }
                            }
                        } catch (err) {
                            _didIteratorError6 = true;
                            _iteratorError6 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                                    _iterator6.return();
                                }
                            } finally {
                                if (_didIteratorError6) {
                                    throw _iteratorError6;
                                }
                            }
                        }

                        result = object;
                        break;
                    }
                case 'array':
                    {
                        var array = new Array();
                        var objectField = field.value[0];
                        var iOffset = offset;
                        while (iOffset < buffer.length) {
                            var iObject = this.decodeField(buffer, iOffset, objectField.length, objectField);
                            array.push(iObject);
                            iOffset += objectField.length;
                        }
                        result = array;
                        break;
                    }
            }
            if (field.name === undefined) return result;else {
                var object = new Object();
                object[field.name] = result;
                return object;
            }
        }
    }, {
        key: 'decodeValue',
        value: function decodeValue(buffer, offset, length, format) {
            switch (format) {
                case 'int':
                case 'int.le':
                    return CSLUtility.toIntLE(buffer, offset, length);
                case 'int.be':
                    return CSLUtility.toIntBE(buffer, offset, length);
                case 'string':
                    return CSLUtility.toString(buffer, offset, length).replace(/\u0000+$/, '');
                case 'bcd':
                    var bcd = buffer[offset];
                    return (bcd >> 4) * 10 + bcd % 16;
                default:
                    throw "unsupported format";
            }
        }
    }]);

    return CSLMessage;
}();