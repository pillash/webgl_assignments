"use strict";

var canvas;
var gl;
var program;

window.onload = function init()
{
    setupUpdateListener();

    canvas = document.getElementById( "gl-canvas" );

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

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    update();
};

function update() {
    var subDivFactor = parseInt(document.getElementById("subDivFactor").value);
    var degreesOfRotation = parseFloat(document.getElementById("degreesOfRotation").value);
    var twistFactor = parseFloat(document.getElementById("twistFactor").value);

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -0.5, -0.288675 ), // (-.5, -sqrt(3)/6)
        vec2(  0,  0.57735 ),    // (0, sqrt(3)/3)
        vec2(  0.5, -0.288675 )  // (.5, -sqrt(3)/6)
    ];

    var points = [];
    divideTriangle(points, vertices[0], vertices[1], vertices[2],
                    subDivFactor);

    //rotatePoints(points, degreesOfRotation, twistFactor);

    var degOfRotationShader = gl.getUniformLocation(program, "degreesOfRotation");
    var twistFactorShader = gl.getUniformLocation(program, "twistFactor");

    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    gl.uniform1f(degOfRotationShader, degreesOfRotation);
    gl.uniform1f(twistFactorShader, twistFactor);

    //render(points);
    renderWireframe(points);
}

function triangle(points, a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle(points, a, b, c, count )
{
    // check for end of recursion

    if ( count === 0 ) {
        triangle(points, a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle(points, a, ab, ac, count );
        divideTriangle(points, c, ac, bc, count );
        divideTriangle(points, b, bc, ab, count );
        divideTriangle(points, ab, bc, ac, count );
    }
}

function render(points)
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

function renderWireframe(points) {
    gl.clear( gl.COLOR_BUFFER_BIT );
    for (var i = 0; i < points.length; i+=3) {
        gl.drawArrays(gl.LINE_LOOP, i, 3);
    }
}

function setupUpdateListener() {
    document.getElementById("updateButton").addEventListener("click", function() {
        update();
    });
}
