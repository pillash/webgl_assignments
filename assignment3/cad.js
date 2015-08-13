window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //var points = spherePoints();
    //var points = generateCone();
    var points = generateCylinder();

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    renderWireframe(points.length);
}

function renderWireframe(numPoints) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < numPoints; i+=3) {
        gl.drawArrays(gl.LINE_LOOP, i, 3);
    }
}

function generateCylinder() {
    var height = 1;
    var topY = .5;
    var bottomY = topY - height;
    var radius = .5;

    var topCircle = generateCircle(radius, topY);
    var bottomCircle = generateCircle(radius, bottomY);

    var points = [];
    for (var i = 0; i < topCircle.length-1; i++) {
        points = points.concat([topCircle[i], bottomCircle[i], topCircle[i+1], bottomCircle[i], topCircle[i+1], bottomCircle[i+1]]);
    }
    return points;
}

function generateCone() {
    var tip = vec4(0, .5, 0, 1);
    var radius = .5;
    var height = 1;

    var theta = 0;
    var y = tip[1] - height;
    var basePoints = generateCircle(radius, y);

    var points = [];
    for (var i = 0; i < basePoints.length-1; i++) {
        points = points.concat([basePoints[i], tip, basePoints[i+1]]);
    }
    return points;
}

function generateCircle(radius, y) {
    var points = [];
    var theta = 0;
    while (theta <= 360) {
        points.push(vec4(radius*Math.cos(rad(theta)), y, radius*Math.sin(rad(theta)), 1.0));
        theta += 10;
    }
    return points;
}

function generateSphere() {
    var rows = [];
    var theta = -90;
    var phi = 0;
    var inc = 10;
    var r = .5;

    while (theta <= 90) {
        var row = [];
        phi = 0;
        while (phi <= 360) {
            var radTheta = rad(theta);
            var radPhi = rad(phi);
            row.push(vec4(r*Math.cos(radTheta)*Math.cos(radPhi), r*Math.sin(radTheta), r*Math.cos(radTheta)*Math.sin(radPhi), 1.0));
            phi += inc;
        }

        rows.push(row);
        theta += inc;
    }

    var points = [];
    for (var i = 0; i < rows.length-1; i++) {
        var r1 = rows[i];
        var r2 = rows[i+1];
        for (var j = 0; j < r1.length-1; j++) {
            points = points.concat(squareToTriangles(r1[j], r1[j+1], r2[j+1], r2[j]));
        }
    }
    return points;
}

function rad(x) {
    return x * Math.PI / 180.0;
}

function squareToTriangles(a, b, c, d) {
    return [a, b, c, a, c, d];
}
