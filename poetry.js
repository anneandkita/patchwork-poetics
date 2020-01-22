window.onload = init;
var poemWords = [
    [
        []
    ]
];

var ctx;
var blockWidth = 25;
var margin = 10;
var numCallbacks = 0;

function init() {
    document.getElementById("poemsubmit").onclick = analyzePoem;
    var canvas = document.getElementById("patchwork");
    ctx = canvas.getContext("2d");

}

function analyzePoem() {
    document.getElementById("display").hidden = false;
    document.getElementById("ui").hidden = true;

    var poem = document.getElementById("poementry").value;
    poemWords = poem.split(/\r?\n/);
    if (typeof poemWords != "undefined") {
        for (var i = 0; i < poemWords.length; i++) {
            poemWords[i] = poemWords[i].split(/ +/);
        }
    }

    drawPoem();
}

function drawPoem() {
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // TODO: figure out longest line and base block width on that
    // TODO: use Merriam Webster API to figure out number of syllables and whether they are stressed or unstressed
    if (typeof poemWords != "undefined") {
        for (let i = 0; i < poemWords.length; i++) {
            for (let j = 0; j < poemWords[i].length; j++) {

                // break up words into syllables

                var request = new XMLHttpRequest();

                request.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        numCallbacks--;
                        var wordObj = JSON.parse(this.responseText);

                        // if Merriam-Webster can't find the word
                        if (typeof wordObj[0].hwi !== 'undefined') {
                            //  countSyllables()
                        }
                        // Get the pronunciation for the current word from the JSON file returned
                        // TODO: deal with if the API returns something strainge
                        var pronunciation = wordObj[0].hwi.prs[0].mw;
                        poemWords[i][j] = pronunciation.split("-");
                        var numSyllables = poemWords[i][j].length;

                        console.log("Num Syllables = " + numSyllables);

                        // if we've gone through every word
                        if (numCallbacks == 0) {
                            drawQuilt();
                        }
                    }
                };
                if (poemWords[i][j] != "") {
                    request.open("GET", 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/' + poemWords[i][j] + '?key=7dc81562-f7c1-4b89-bf78-94e620647001', true);
                    // Send request
                    request.send();
                    numCallbacks++;
                }
            }
        }
    }
}


function drawQuilt() {
    // go through each line
    if (typeof poemWords != "undefined") {
    for (var i = 0; i < poemWords.length; i++) {
        var blockNum = 0;
        // go through each word
        for (var j = 0; j < poemWords[i].length; j++) {
            // go through each syllable
            for (var k = 0; k < poemWords[i][j].length; k++) {
                var rot = 0;
                // TODO: Is this syllable stressed or unstressed?

                if (poemWords[i][j][k][0] == '\u02c8')
                    rot = 1;
                // draw each syllable as an HST
                drawHST(blockNum, i, rot);
                blockNum++;

            }
        }
    }
}
}

function drawHST(x, y, rot) {
    // draw the top left part of the HST
    x = x * blockWidth;
    y = y * blockWidth;

    if (rot == 1) {
        // stressed
        // draw top left part of HST black
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(margin + x, margin + y);
        ctx.lineTo(margin + x + blockWidth, margin + y);
        ctx.lineTo(margin + x, margin + y + blockWidth);
        ctx.closePath();
        ctx.fill();

        // draw the bottom right part of the HST - white
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(margin + x + blockWidth, margin + y);
        ctx.lineTo(margin + x + blockWidth, margin + y + blockWidth);
        ctx.lineTo(margin + x, margin + y + blockWidth);
        ctx.closePath();
        ctx.fill();

    } else if (rot == 0) {
        // unstressed
        // draw bottom left part of HST
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.moveTo(margin + x, margin + y);
        ctx.lineTo(margin + x + blockWidth, margin + y + blockWidth);
        ctx.lineTo(margin + x, margin + y + blockWidth);
        ctx.closePath();
        ctx.fill();

        // draw the top right part of the HST
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(margin + x, margin + y);
        ctx.lineTo(margin + x + blockWidth, margin + y);
        ctx.lineTo(margin + x + blockWidth, margin + y + blockWidth);
        ctx.closePath();
        ctx.fill();
    }
}

function drawWord(x, y, pronunciation) {
    // figure out rotation based on the word
    console.log(pronunciation);

    // count number of syllables
    var syllables = pronunciation.split("-");
    var numSyllables = syllables.length;

    console.log("Num Syllables = " + numSyllables);
    if (typeof numSyllables != "undefined") {
    for (var i = 0; i < numSyllables; i++) {
        var rot = 0;
        // draw each HST based on x & y and syllable stress
        if (syllables[i][0] == '\u02c8') {
            rot = 1;
        }
        drawHST(x, y, rot);

    }
}
}
// drawHST(x, y, rot); // TODO - this will need to be per syllable and deal with stresses at some point
