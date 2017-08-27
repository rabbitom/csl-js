import CSLUtility from './CSLUtility';

export default class CSLMessage {

    constructor(pattern) {
        //de could mean definition
        var fields = new Map();
        var templates = new Map();
        var addField = function(field) {
            if(field.id)
                fields.set(field.id, field);
            if(field['as-template'])
                templates.set(field['as-template'], field);
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
            return;
        return this.encodeField(object, field);
    }

    encodeField(object, field) {
        switch(field.type) {
            case 'fixed':
                return this.encodeValue(field.length, field.format, field.value);
            case 'variable': {
                var value = object[field.name];
                return this.encodeValue(field.length, field.format, value);
            }
            case 'combination': {
                var array = new Uint8Array(field.length);
                var offset = 0;
                for(var iField of field.value) {
                    var iArray = this.encodeField(object, iField);
                    array.set(iArray, offset);
                    offset += iArray.length;
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
            field = this.fields.get(fieldId);
        if(field == null)
            throw "no field to decode: " + fieldId;
            //return;
        return this.decodeField(buffer, offset, length, field);
    }

    decodeField(buffer, offset, length, field) {
        if(offset === undefined)
            offset = 0;
        if((length !== undefined) && (length < field.length))
            throw "length too short for field";
            //return;
        switch(field.type) {
            case 'index':
            case 'fixed':
            case 'variable': {
                var value = this.decodeValue(buffer, offset, field.length, field.format);
                if((field.type == 'fixed') && (value != field.value[0]))
                    throw "value mismatched for fixed field";
                    //return;
                if(field.type == 'index') {
                    for(var item of field.value) {
                        if(item.value == value)
                            return this.decode(buffer, offset, length, item.id);
                    }
                }
                var object = new Object();
                object[field.name] = value;
                return object;
            }
            case 'combination': {
                var object = new Object();
                var iOffset = offset;
                for(var iField of field.value) {
                    var iObject = this.decodeField(buffer, iOffset, iField.length, iField);
                    if(iObject === undefined)
                        return;
                    iOffset += iField.length;
                    for(var key in iObject)
                        object[key] = iObject[key];
                }
                return object;
            }
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