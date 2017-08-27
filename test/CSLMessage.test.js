import should from 'should';
import CSLMessage from '../CSLMessage';

describe('encode', ()=>{

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

describe('decode', ()=>{

    describe('decode-fix', ()=>{
        var pattern = {
            "name": "command",
            "length": 1,
            "type": "fixed",
            "format": "int",
            "value": [1]
        }
        var csl = new CSLMessage(pattern);
        var a = csl.decode([1]);
        should(a["command"]).equal(1);
        try {
            var b = csl.decode([2]);
        }
        catch (err) {
        }
        should(b).equal(undefined);
    });

    describe('decode-var', ()=>{
        var pattern = {
            "name": "battery-level",
            "length": 1,
            "type": "variable",
            "format": "int"
        }
        var csl = new CSLMessage(pattern);
        var a = csl.decode([1]);
        should(a["battery-level"]).equal(1);
    });

    describe('decode-int', ()=>{
        var time = Math.floor(new Date().getTime()/1000);
        var array = [time % 0x100, (time >> 8) % 0x100, (time >> 16) % 0x100, (time >> 24) % 0x100];
        var pattern = {
            "name": "start-time",
            "length": 4,
            "type": "variable",
            "format": "int.le"
        }
        var csl = new CSLMessage(pattern);
        var a = csl.decode(array);
        should(a["start-time"]).equal(time);
    });

    describe('decode-be', ()=>{
        var time = Math.floor(new Date().getTime()/1000);
        var array = [(time >> 24) % 0x100, (time >> 16) % 0x100, (time >> 8) % 0x100, time % 0x100];
        var pattern = {
            "name": "start-time",
            "length": 4,
            "type": "variable",
            "format": "int.be"
        }
        var csl = new CSLMessage(pattern);
        var a = csl.decode(array);
        should(a["start-time"]).equal(time);
    });

    describe('decode-str', ()=>{
        var str = 'item name';
        var array = new Array(str.length);
        for(var i=0; i<str.length; i++)
            array[i] = str.charCodeAt(i);
        var maxLength = 15;
        var pattern = {
            "name": "name",
            "type": "variable",
            "length": maxLength,
            "format": "string"
        }
        var csl = new CSLMessage(pattern);
        var a = csl.decode(array);
        should(a["name"]).equal(str);
    });
});

describe('combination', ()=>{
    var commandId = 2;
    var str = 'item name';
    var pattern = {
        "length": 16,
        "type": "combination",
        "value": [
            {
                "name": "command",
                "length": 1,
                "type": "variable",
                "format": "int"
            },
            {
                "name": "name",
                "type": "variable",
                "length": 15,
                "format": "string"
            }
        ]
    }
    var csl = new CSLMessage(pattern);
    describe('combination-encode', ()=>{
        var a = csl.encode({
            "command": commandId,
            "name": str
        });
        should(a.length).equal(16);
        should(a[0]).equal(commandId);
        for(var i=0; i<15; i++)
            if(i < str.length)
                should(a[1+i]).equal(str.charCodeAt(i));
            else
                should(a[1+i]).equal(0);
    });
    describe('combination-decode', ()=>{
        var array = new Array(1+str.length);
        array[0] = commandId;
        for(var i=0; i<str.length; i++)
            array[1+i] = str.charCodeAt(i);
        var a = csl.decode(array);
        should(a["command"]).equal(commandId);
        should(a["name"]).equal(str);
    });
    describe('combination-codec', ()=>{
        var array = csl.encode({
            "command": commandId,
            "name": str
        });
        var a = csl.decode(array);
        should(a["command"]).equal(commandId);
        should(a["name"]).equal(str);
    });
});

describe('combination-fix', ()=>{
    var commandId = 2;
    var str = 'item name';
    var pattern = {
        "length": 16,
        "type": "combination",
        "value": [
            {
                "name": "command",
                "length": 1,
                "type": "fixed",
                "format": "int",
                "value": [commandId]
            },
            {
                "name": "name",
                "type": "variable",
                "length": 15,
                "format": "string"
            }
        ]
    }
    var csl = new CSLMessage(pattern);
    describe('combination-fix-encode', ()=>{
        var a = csl.encode({
            "name": str
        });
        should(a.length).equal(16);
        should(a[0]).equal(commandId);
        for(var i=0; i<15; i++)
            if(i < str.length)
                should(a[1+i]).equal(str.charCodeAt(i));
            else
                should(a[1+i]).equal(0);
    });
    describe('combination-fix-decode', ()=>{
        var array = new Array(1+str.length);
        array[0] = commandId;
        for(var i=0; i<str.length; i++)
            array[1+i] = str.charCodeAt(i);
        var a = csl.decode(array);
        should(a["command"]).equal(commandId);
        should(a["name"]).equal(str);
    });
});

describe('index', ()=>{
    var batteryId = 1;
    var itemNameId = 2;
    var pattern = [
        {
            "id": "cmc-command",
            "length": 1,
            "type": "index",
            "format": "int",
            "value": [
                {
                    "value": batteryId,
                    "id": "battery-response"
                },
                {
                    "value": itemNameId,
                    "id": "item-name-response"
                }
            ]
        },
        {
            "id": "battery-response",
            "length": 2,
            "type": "combination",
            "value": [
                {
                    "name": "command",
                    "length": 1,
                    "type": "fixed",
                    "format": "int",
                    "value": [batteryId]
                },
                {
                    "name": "battery-level",
                    "length": 1,
                    "type": "variable",
                    "format": "int"
                }
            ]
        },
        {
            "id": "item-name-response",
            "length": 16,
            "type": "combination",
            "as-template": "item-name",
            "value": [
                {
                    "name": "command",
                    "length": 1,
                    "type": "fixed",
                    "format": "int",
                    "value": [itemNameId]
                },
                {
                    "name": "name",
                    "type": "variable",
                    "length": 15,
                    "format": "string"
                }
            ]
        },
    ];
    var csl = new CSLMessage(pattern);
    var battery = csl.decode([batteryId, 1]);
    should(battery["battery-level"]).equal(1);
    var str = 'item name';
    var array = new Array(1+str.length);
    array[0] = itemNameId;
    for(var i=0; i<str.length; i++)
        array[1+i] = str.charCodeAt(i);
    var itemName = csl.decode(array);
    should(itemName.name).equal(str);
});