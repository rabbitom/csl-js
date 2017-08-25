import CSLUtility from './CSLUtility';

export default class CSLMessage {

    constructor(pattern) {
        //de could mean definition
        this.fields = new Map();
        this.templates = new Map();
        var addField = function(field) {
            if(field.id)
                this.fields.set(field.id, field);
            // if(field['as-template'])
            //     this.templates.set(field['as-template'], field);
            if(field.type == 'enum') {
                for(var subField of field.values)
                    addField(subField);
            }
        }
        if(pattern.id)
            addField(pattern);
        else
            this.defaultField = pattern;
    }

    encode(object, filedId) {
        var field = this.defaultField;
        if(filedId !== undefined)
            field = this.fields[filedId];
        if(field == null)
            return;
        switch(field.type) {
            case 'fixed':
                return this.encodeValue(field.length, field.format, field.value);
            case 'variable': {
                var value = object[field.name];
                return this.encodeValue(field.length, field.format, value);
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

    decode(buffer, offset, length) {

    }
}