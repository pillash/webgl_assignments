"use strict";

var canvas;
var gl;
var program;
var canvasWidth;
var canvasHeight;

window.onload = function init() {
    var vec2Size = sizeof['vec2'];
    var vec4Size = sizeof['vec4'];

    var colorMap = {
        "blue": vec4(0.0, 0.0, 1.0, 1.0),
        "red": vec4(1.0, 0.0, 0.0, 1.0),
        "yellow": vec4(1.0, 1.0, 0.0, 1.0),
        "green": vec4(0.0, 1.0, 0.0, 1.0),
        "orange": vec4(1.0, 0.4, 0.0, 1.0),
        "purple": vec4(0.4, 0.0, 1.0, 1.0),
        "white": vec4(1.0, 1.0, 1.0, 1.0)
    };


    canvas = document.getElementById("gl-canvas");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Buffer for vertices

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    var maxNumPoints = 20000;
    gl.bufferData( gl.ARRAY_BUFFER, maxNumPoints*vec2Size, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Buffer for colors
    var cbufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cbufferId );

    gl.bufferData( gl.ARRAY_BUFFER, maxNumPoints*vec4Size, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var drawing = false;
    var curveIndex = 1;
    var curves = {};
    var overallIndex = 0;
    var currentColor;

    var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT );
        for (var c in curves) {
            gl.drawArrays(gl.LINE_STRIP, curves[c].start, curves[c].numVertices);
        }
    };

    canvas.addEventListener("mousedown", function() {
        var p = getClipCoords(event);

        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, vec2Size*overallIndex, flatten(p));
        
        var c = {"start": overallIndex, "numVertices": 1}
        curves[curveIndex] = c;
        overallIndex++;

        drawing = true;

        // set color
        currentColor = colorMap[document.getElementById("color").value];
        gl.bindBuffer(gl.ARRAY_BUFFER, cbufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, vec4Size*overallIndex, flatten(currentColor));
    });

    canvas.addEventListener("mousemove", function() {
        if (!drawing) {
            return;
        }

        var p = getClipCoords(event);
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, vec2Size*overallIndex, flatten(p));
        overallIndex++;
        curves[curveIndex].numVertices++;

        gl.bindBuffer(gl.ARRAY_BUFFER, cbufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, vec4Size*overallIndex, flatten(currentColor));

        render();
    });

    canvas.addEventListener("mouseup", function() {
        var p = getClipCoords(event);

        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, vec2Size*overallIndex, flatten(p));
        
        gl.bindBuffer(gl.ARRAY_BUFFER, cbufferId);
        gl.bufferSubData(gl.ARRAY_BUFFER, vec4Size*overallIndex, flatten(currentColor));

        overallIndex++;
        curves[curveIndex].numVertices++;

        render();

        drawing = false; 
        curveIndex++;
    });

    var clearButton = document.getElementById("clearButton");
    clearButton.addEventListener("click", function() {
        overallIndex = 0;
        curveIndex = 1;
        curves = {};
        drawing = false;
        gl.clear( gl.COLOR_BUFFER_BIT );
    });

    render();
};

function getClipCoords(e) {
    var x = e.clientX - canvas.offsetLeft;
    var y = e.clientY - canvas.offsetTop;
    return vec2(-1 + 2*x/canvasWidth, -1 + 2*(canvasHeight - y)/canvasHeight);  
}

