var mainDiv;
var inputText;
var inputBinary;
var canvas;
var canvasCenter = { x: 0, y: 0 };
var canvasScale = 1;
var dragging = false;
var mouseX = 0;
var mouseY = 0;
function generateTree() {
    if (inputText.value.length < 2)
        return;
    var compressed = huffmanTree.compress(inputText.value);
    mainDiv.innerHTML = "<h1>Uncompressed size: " + byteLength(inputText.value) + " bytes</h1>";
    mainDiv.innerHTML += "<h1>Compressed size: " + Math.round(compressed.length / 8) + " bytes</h1>";
    inputBinary.value = compressed;
    drawTree();
}
function generateText() {
    if (inputBinary.value.length < 32)
        return;
    var compressed = inputBinary.value;
    inputText.value = huffmanTree.decompress(compressed);
    mainDiv.innerHTML = "<h1>Uncompressed size: " + byteLength(inputText.value) + " bytes</h1>";
    mainDiv.innerHTML += "<h1>Compressed size: " + Math.round(compressed.length / 8) + " bytes</h1>";
    huffmanTree.compress(inputText.value);
    drawTree();
}
function drawTree() {
    if (canvas.getContext) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.75;
        canvasCenter = { x: canvas.width / 2, y: 10 };
        canvasScale = 1;
        huffmanTree.drawTree(canvas.getContext('2d'), canvasCenter, canvasScale);
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
function mouseDownListener(evt) {
    mouseX = evt.clientX;
    mouseY = evt.clientY;
    dragging = true;
    if (dragging) {
        window.addEventListener("mousemove", mouseMoveListener, false);
    }
    canvas.removeEventListener("mousedown", mouseDownListener, false);
    window.addEventListener("mouseup", mouseUpListener, false);

    //code below prevents the mouse down from having an effect on the main browser window:
    if (evt.preventDefault) {
        evt.preventDefault();
    } //standard
    else if (evt.returnValue) {
        evt.returnValue = false;
    } //older IE
    return false;
}
function mouseUpListener(evt) {
    canvas.addEventListener("mousedown", mouseDownListener, false);
    window.removeEventListener("mouseup", mouseUpListener, false);
    if (dragging) {
        dragging = false;
        window.removeEventListener("mousemove", mouseMoveListener, false);
    }
}
function mouseMoveListener(evt) {
    canvasCenter.x += evt.clientX - mouseX;
    canvasCenter.y += evt.clientY - mouseY;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
    if (canvas.getContext) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        huffmanTree.drawTree(canvas.getContext('2d'), canvasCenter, canvasScale);
    }
}
function canvasZoom(evt) {
    canvasScale -= evt.deltaY * 0.001;
    if (canvasScale < 0)
        canvasScale = 0.05;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    if (canvas.getContext)
        huffmanTree.drawTree(canvas.getContext('2d'), canvasCenter, canvasScale);
}
function canvasResize(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.75;
    huffmanTree.drawTree(canvas.getContext('2d'), canvasCenter, canvasScale);
}
document.addEventListener("DOMContentLoaded", function (e) {
    mainDiv = document.getElementById("result");
    inputText = document.getElementById("inputText");
    inputBinary = document.getElementById("inputBinary");
    canvas = document.getElementById("mainCanvas");
    canvas.addEventListener("mousedown", mouseDownListener, false);
    canvas.addEventListener("mousewheel", canvasZoom, false);
    window.addEventListener('resize', canvasResize);
});