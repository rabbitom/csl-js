class CSLMessage {

    constructor(pattern) {
        var fields = new Object();
        var templates = new Object();
        var addField = function(field) {
            if(field.id)
                fields[field.id] = field;
            if(field['as-template'])
                templates[field['as-template']] = field;
            if((field.type == 'combination') || (field.type == 'array'))
                for(var subField of field.value)
                    addField(subField);
        }
        if(pattern instanceof Array) {
            for(var field of pattern)
                addField(field);
            this.defaultField = pattern[0];
        }
        else {
            this.defaultField = pattern;
            addField(pattern);
        }
        this.fields = fields;
        this.templates = templates;
    }

    encode(object, fieldId) {
        var field = this.defaultField;
        if(fieldId !== undefined)
            field = this.fields[fieldId];
        if(field == null)
            throw "no field to encode: " + fieldId;
        return this.encodeField(object, field);
    }

    encodeField(object, field) {
        if(field.template) {
            var template = this.templates[field.template];
            if(template === undefined)
                throw "no template found: " + field.template;
            for(var key in template) {
                if((key != 'id') && (key != 'as-template') && (field[key] === undefined))
                    field[key] = template[key];
            }
            field.template = null;
        }
        var value;
        if(object != null)
            value = (field.name === undefined) ? object : object[field.name];        
        switch(field.type) {
            case 'fixed':
                return this.encodeValue(field.length, field.format, field.value);
            case 'variable':
                return this.encodeValue(field.length, field.format, value);
            case 'index': {
                for(var item of field.value) {
                    if(item.value == value)
                        return this.encode(object, item.id);
                }
                throw "value not found in index: " + value;
            }
            case 'combination': {
                var array = new Uint8Array(field.length);
                var offset = 0;
                for(var iField of field.value) {
                    var iArray = this.encodeField(value, iField);
                    array.set(iArray, offset);
                    offset += iArray.length;
                }
                return array;
            }
            case 'array': {
                if(!(value instanceof Array))
                    throw "could not encode as array: " + JSON.stringify(value);
                var array = new Uint8Array(field.length);
                var offset = 0;
                var itemField = field.value[0];
                for(var i=0; i<value.length; i++) {
                    var itemArray = this.encodeField(value[i], itemField);
                    if(offset + itemArray.length > field.length)
                        throw 'array is too short';
                    array.set(itemArray, offset);
                    offset += itemArray.length;
                }
                return array;
            }
        }
    }

    encodeValue(length, format, value) {
        var array = new Uint8Array(length);
        switch(format) {
            case 'int':
            case 'int.le':
                CSLUtility.writeIntLE(value, array, 0, length);
                break;
            case 'int.be':
                CSLUtility.writeIntBE(value, array, 0, length);
                break;
            case 'string':
                var arrayFromString = CSLUtility.arrayFromString(value);
                for(var i=0; i<length; i++) {
                    if(i < arrayFromString.length)
                        array[i] = arrayFromString[i];
                    else
                        array[i] = 0;
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

    decode(buffer, offset, length, fieldId) {
        var field = this.defaultField;
        if(fieldId !== undefined)
            field = this.fields[fieldId];
        if(field == null)
            throw "no field to decode: " + fieldId;
        return this.decodeField(buffer, offset, length, field);
    }

    decodeField(buffer, offset, length, field) {
        if(offset === undefined)
            offset = 0;
        if((length !== undefined) && (length < field.length))
            throw "length too short for field";
        var result;
        switch(field.type) {
            case 'index':
            case 'fixed':
            case 'variable': {
                var value = this.decodeValue(buffer, offset, field.length, field.format);
                if((field.type == 'fixed') && (value != field.value[0]))
                    throw "value mismatch for fixed field";
                if(field.type == 'index') {
                    for(var item of field.value) {
                        if(item.value == value)
                            return this.decode(buffer, offset, length, item.id);
                    }
                    if(result === undefined)
                        throw "value mismatch for index field";
                }
                else
                    result = value;
                break;
            }
            case 'combination': {
                var object = new Object();
                var iOffset = offset;
                for(var iField of field.value) {
                    var iObject = this.decodeField(buffer, iOffset, iField.length, iField);
                    if(iObject === undefined)
                        throw "decode combination field failed";
                    iOffset += iField.length;
                    for(var key in iObject)
                        object[key] = iObject[key];
                }
                result = object;
                break;
            }
            case 'array': {
                var array = new Array();
                var objectField = field.value[0];
                var iOffset = offset;
                while(iOffset < buffer.length) {
                    var iObject = this.decodeField(buffer, iOffset, objectField.length, objectField);
                    array.push(iObject);
                    iOffset += objectField.length;
                }
                result = array;
                break;
            }
        }
        if(field.name === undefined)
            return result;
        else {
            var object = new Object();
            object[field.name] = result;
            return object;
        }
    }

    decodeValue(buffer, offset, length, format) {
        switch(format) {
            case 'int':
            case 'int.le':
                return CSLUtility.toIntLE(buffer, offset, length);
            case 'int.be':
                return CSLUtility.toIntBE(buffer, offset, length);
            case 'string':
                return CSLUtility.toString(buffer, offset, length).replace(/\u0000+$/, '');
            case 'bcd':
                var bcd = buffer[offset];
                return (bcd >> 4) * 10 + (bcd % 16);
            default:
                throw "unsupported format";
        }
    }
}