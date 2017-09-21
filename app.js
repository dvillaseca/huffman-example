const mainDiv = document.getElementById("result");
const inputText = document.getElementById("inputText");
const inputBinary = document.getElementById("inputBinary");
const canvas = document.getElementById("mainCanvas");
function generateTree() {
    var compressed = huffmanTree.compress(inputText.value);
    mainDiv.innerHTML = "<h1>Uncompressed size: " + byteLength(inputText.value) + " bytes</h1>";
    mainDiv.innerHTML += "<h1>Compressed size: " + Math.round(compressed.length / 8) + " bytes</h1>";
    inputBinary.value = compressed;
    if (canvas.getContext) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth;
        huffmanTree.drawTree(canvas.getContext('2d'), { x: canvas.width / 2, y: 10 });
    }
}
function generateText() {
    var compressed = inputBinary.value;
    inputText.value = huffmanTree.decompress(compressed);
    mainDiv.innerHTML = "<h1>Uncompressed size: " + byteLength(inputText.value) + " bytes</h1>";
    mainDiv.innerHTML += "<h1>Compressed size: " + Math.round(compressed.length / 8) + " bytes</h1>";

    if (canvas.getContext) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth;
        huffmanTree.compress(inputText.value);
        huffmanTree.drawTree(canvas.getContext('2d'), { x: canvas.width / 2, y: 10 });
    }
}
function byteLength(str) {
    // returns the byte length of an utf8 string
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
        var code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s += 2;
        if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
    }
    return s;
}
function text2Binary(text) {
    var letters = text.split('');
    var bin = "";
    for (var i = 0; i < letters.length; i++) {
        var num = letters[i].charCodeAt(0).toString(2);
        bin += "00000000".slice(String(num).length) + num;
    }
    return bin;
}