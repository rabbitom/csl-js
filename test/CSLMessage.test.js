import should from 'should';
import CSLMessage from '../CSLMessage';

describe('CSLMessage', ()=>{

    describe('encode-fixed', ()=>{
        var pattern = {
            "name": "command",
            "length": 1,
            "type": "fixed",
            "format": "int",
            "value": [1]
        };
        var csl = new CSLMessage(pattern);
        var a = csl.encode();
        should(a.length).equal(1);
        should(a[0]).equal(1);
    });

    describe('encode-var', ()=>{
        var pattern = {
            "name": "battery-level",
            "length": 1,
            "type": "variable",
            "format": "int"
        }
        var csl = new CSLMessage(pattern);
        var a = csl.encode({
            'battery-level': 1
        });
        should(a.length).equal(1);
        should(a[0]).equal(1);
    });

    describe('encode-int', ()=>{
        var time = Math.floor(new Date().getTime()/1000);
        var pattern = {
            "name": "start-time",
            "length": 4,
            "type": "variable",
            "format": "int.le"
        }
        var csl = new CSLMessage(pattern);
        var a = csl.encode({
            'start-time': time
        });
        should(a.length).equal(4);
        should(a[0] + a[1] * 0x100 + a[2] * 0x10000 + a[3] * 0x1000000).equal(time);
    });

    describe('encode-be', ()=>{
        var time = Math.floor(new Date().getTime()/1000);
        var pattern = {
            "name": "start-time",
            "length": 4,
            "type": "variable",
            "format": "int.be"
        }
        var csl = new CSLMessage(pattern);
        var a = csl.encode({
            'start-time': time
        });
        should(a.length).equal(4);
        should(a[3] + a[2] * 0x100 + a[1] * 0x10000 + a[0] * 0x1000000).equal(time);
    });
    
    describe('encode-str', ()=>{
        var str = 'item name';
        var maxLength = 15;
        var pattern = {
            "name": "name",
            "type": "variable",
            "length": maxLength,
            "format": "string"
        }
        var csl = new CSLMessage(pattern);
        var a = csl.encode({
            'name': str
        });
        should(a.length).equal(maxLength);
        for(var i=0; i<maxLength; i++)
            if(i < str.length)
                should(a[i]).equal(str.charCodeAt(i));
            else
                should(a[i]).equal(0);
    });

    describe('encode-bcd', ()=>{
        var pattern = {
            "name": "year",
            "length": 1,
            "type": "variable",
            "format": "bcd",
        };
        var csl = new CSLMessage(pattern);
        var a = csl.encode({
            'year': 17
        });
        should(a.length).equal(1);
        should(a[0]).equal(0x17);
    });
});