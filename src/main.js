function encode() {
    var pattern = {
        "name": "command",
        "length": 1,
        "type": "fixed",
        "format": "int",
        "value": [1]
    };
    var csl = new CSLMessage(pattern);
    return csl.encode();
}
