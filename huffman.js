class HuffmanTree {
    constructor() {
        this.tree = null;
        this.letters = null;
        this.canvasScale = 1;
    }
    compress(text) {
        var letters = text.split('');
        var lettersCount = {};
        for (var i = 0; i < letters.length; i++) {
            if (lettersCount[letters[i]] == null) {
                lettersCount[letters[i]] = 0;
            }
            lettersCount[letters[i]]++;
        }
        this.tree = [];
        for (var letter in lettersCount) {
            this.tree.push({
                sum: lettersCount[letter],
                letters: [letter],
                left: null,
                right: null,
                letter: letter
            });
        }
        this.tree.sort(function (a, b) {
            return b.sum - a.sum;
        });
        this.letters = letters;
        this.makeTree();
        var compressedText = this.compressText();
        var serializedTree = [];
        this.serializeTree(this.tree, serializedTree);
        return this.numberToBinary(serializedTree.length) + serializedTree.join('') + compressedText.join('');
    }
    makeTree() {
        while (this.tree.length > 1) {
            var left = this.tree.pop();
            var right = this.tree.pop();
            var newNode = {
                sum: left.sum + right.sum,
                left: left,
                right: right,
                letters: left.letters.concat(right.letters)
            }
            this.tree.push(newNode);
            this.tree.sort(function (a, b) {
                return b.sum - a.sum;
            });
        }
        this.tree = this.tree[0];
    }
    compressText() {
        var bin = [];
        //console.log(this.tree);
        for (var i = 0; i < this.letters.length; i++) {
            this.letterToBinary(this.letters[i], this.tree, bin);
        }
        return bin;
    }
    letterToBinary(letter, tr, bin) {
        if (tr.letter != null) {
            return bin;
        }
        if (tr.left != null && tr.left.letters.indexOf(letter) !== -1) {
            bin.push(0);
            return this.letterToBinary(letter, tr.left, bin);
        }
        else {
            bin.push(1);
            return this.letterToBinary(letter, tr.right, bin);
        }
    }
    serializeTree(node, bin) {
        if (node.letter != null) {
            bin.push(1);
            var num = node.letter.charCodeAt(0).toString(2);
            var binLetter = ("000000000000000000000000".slice(String(num).length) + num).split('');
            for (var i = 0; i < binLetter.length; i++) {
                bin.push(parseInt(binLetter[i]));
            }
        }
        else {
            bin.push(0);
            this.serializeTree(node.left, bin);
            this.serializeTree(node.right, bin);
        }
    }
    drawTree(ctx, center, canvasScale) {
        if (this.tree == null)
            return;
        this.canvasScale = canvasScale;
        ctx.font = (12 * this.canvasScale) + "px Arial";
        ctx.textAlign = "center";
        ctx.beginPath();
        this.drawNode(ctx, this.tree, center.x, center.y, 50 * this.canvasScale * this.tree.letters.length);
        ctx.closePath();
        ctx.lineWidth = 2 * this.canvasScale;
        ctx.strokeStyle = '#888888';
        ctx.stroke();
    }
    drawNode(ctx, node, x, y, xSize) {
        ctx.closePath();
        ctx.lineWidth = 2 * this.canvasScale;
        ctx.strokeStyle = '#888888';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 10 * this.canvasScale, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#888888';
        ctx.fill();
        ctx.closePath();
        if (node.letter != null) {

            ctx.fillStyle = '#000000';
            ctx.fillText(node.sum.toString(), x, y + 4 * this.canvasScale);

            ctx.beginPath();
            ctx.arc(x, y + 20 * this.canvasScale, 10 * this.canvasScale, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#ff0000';
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = '#000000';
            ctx.fillText(node.letter, x, y + 24 * this.canvasScale);
        }
        else {
            ctx.beginPath();
            var lx = x, ly = y, rx = x, ry = y;
            ry += 40 * this.canvasScale;
            ly += 40 * this.canvasScale;
            rx += xSize;
            lx -= xSize;
            ctx.moveTo(x, y);
            ctx.lineTo(lx, ly);
            ctx.moveTo(x, y);
            ctx.lineTo(rx, ry);

            this.drawNode(ctx, node.left, lx, ly, xSize * 0.5);
            this.drawNode(ctx, node.right, rx, ry, xSize * 0.5);

            ctx.fillStyle = '#000000';
            ctx.fillText(node.sum.toString(), x, y + 4 * this.canvasScale);
        }
    }
    numberToBinary(num) {
        var bb = (num >>> 0).toString(2);
        return "00000000000000000000000000000000".slice(String(bb).length) + bb;
    }
    decompress(binaryString) {
        var invalid = false;
        var serializedArray = binaryString.split('').map(function (val) {
            var i = parseInt(val);
            if (i > 1 || i < 0)
                invalid = true;
            return i;
        });
        if (invalid) {
            return "";
        }
        var treeLength = this.binToNumber(serializedArray.slice(0, 32));
        this.tree = this.deserializeTree(serializedArray.slice(32, treeLength + 32));
        return this.decompressText(serializedArray.slice(treeLength + 32, serializedArray.length), this.tree);
    }
    deserializeTree(bin) {
        if (bin.length != 0) {
            var bit = bin.shift();
            if (bit == 1) {
                var str = "";
                for (var i = 0; i < 24; i++) {
                    str += bin.shift().toString();
                }
                return { left: null, right: null, letter: String.fromCharCode(parseInt(str, 2)) };
            }
            else {
                return { left: this.deserializeTree(bin), right: this.deserializeTree(bin), letter: null };
            }
        }
    }
    decompressText(bin, tree) {
        var tx = "";
        var node = tree;
        while (true) {
            if (node.letter == null) {
                if (bin.shift() === 0) {
                    node = node.left;
                }
                else {
                    node = node.right;
                }
            }
            else {
                tx += node.letter;
                node = tree;
                if (bin.length === 0) {
                    return tx;
                }
            }
        }
    }
    binToNumber(bArray) {
        var final = 0;
        for (var i = 0; i < bArray.length; i++) {
            final += Math.pow(2, bArray.length - i - 1) * bArray[i];
        }
        return final;
    }
}
const huffmanTree = new HuffmanTree();