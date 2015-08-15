var canvas;
var gl;
var vBuffer;
var transMatrixUniform;
var colorUniform;

var colorMap = {
    "blue": vec4(0.0, 0.0, 1.0, 1.0),
    "red": vec4(1.0, 0.0, 0.0, 1.0),
    "yellow": vec4(1.0, 1.0, 0.0, 1.0),
    "green": vec4(0.0, .5, 0.0, 1.0),
    "orange": vec4(1.0, 0.4, 0.0, 1.0),
    "purple": vec4(0.4, 0.0, 1.0, 1.0),
};

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    transMatrixUniform = gl.getUniformLocation(program, "transformationMatrix");
    colorUniform = gl.getUniformLocation(program, "vColor");

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var renderOptionsList = [];
    var currentRenderIndex = -1;
    var addToRenderList = function (name, index) {
        var list = document.getElementById("existingShapesList");
        var option = document.createElement("option");
        option.value = index;
        option.innerHTML = name;
        list.appendChild(option);
    };

    var setOptionsUI = function (options) {
        document.getElementById("xRotation").value = options.rotation.x;
        document.getElementById("xRotationOutput").value = options.rotation.x;
        document.getElementById("yRotation").value = options.rotation.y;
        document.getElementById("yRotationOutput").value = options.rotation.y;
        document.getElementById("zRotation").value = options.rotation.z;
        document.getElementById("zRotationOutput").value = options.rotation.z;
        document.getElementById("color").value = options.color.name;
    };

    var createButton = document.getElementById("createShape");
    createButton.addEventListener("click", function(e) {
        var shapeName = document.getElementById("shapeList").value;
        var currentRenderOptions = createDefaultRenderOptions(shapeName);
        renderOptionsList.push(currentRenderOptions);
        currentRenderIndex = renderOptionsList.length-1;
        
        addToRenderList(shapeName, currentRenderIndex);
        setOptionsUI(currentRenderOptions);

        renderAll(renderOptionsList);
    });

    document.getElementById("existingShapesList").addEventListener("change", function (e) {
        currentRenderIndex = e.target.value;
        setOptionsUI(renderOptionsList[currentRenderIndex]);
    });

    document.getElementById("color").addEventListener("change", function (e) {
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }

        var colorName = e.target.value;
        renderOptions.color = {'name': colorName, 'value': colorMap[colorName]};
        renderAll(renderOptionsList);
    });

    document.getElementById("xRotation").addEventListener("input", function (e) {
        document.getElementById("xRotationOutput").value = e.target.value;
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }

        renderOptions.rotation.x = e.target.value;
        renderAll(renderOptionsList);
    });
    document.getElementById("yRotation").addEventListener("input", function (e) {
        document.getElementById("yRotationOutput").value = e.target.value;
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }

        renderOptions.rotation.y = e.target.value;
        renderAll(renderOptionsList);
    });
    document.getElementById("zRotation").addEventListener("input", function (e) {
        document.getElementById("zRotationOutput").value = e.target.value;
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }

        renderOptions.rotation.z = e.target.value;
        renderAll(renderOptionsList);
    });

    var changeScale = function(renderOptions, value) {
        renderOptions.scale.x += value;
        renderOptions.scale.y += value;
        renderOptions.scale.z += value;
    };

    document.getElementById("scaleIncreaseButton").addEventListener("click", function (e) {
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }
        changeScale(renderOptions, .1);
        renderAll(renderOptionsList);
    });
    document.getElementById("scaleDecreaseButton").addEventListener("click", function (e) {
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }
        changeScale(renderOptions, -.1);
        renderAll(renderOptionsList);
    });

    document.getElementById("leftButton").addEventListener("click", function (e) {
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }

        renderOptions.translation.x -= .1;
        renderAll(renderOptionsList);
    });
    document.getElementById("rightButton").addEventListener("click", function (e) {
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }

        renderOptions.translation.x += .1;
        renderAll(renderOptionsList);
    });
    document.getElementById("upButton").addEventListener("click", function (e) {
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }

        renderOptions.translation.y += .1;
        renderAll(renderOptionsList);
    });
    document.getElementById("downButton").addEventListener("click", function (e) {
        var renderOptions = renderOptionsList[currentRenderIndex];
        if (!renderOptions) {
            return;
        }

        renderOptions.translation.y -= .1;
        renderAll(renderOptionsList);
    });
}

function createDefaultRenderOptions(shapeName) {
    var renderOptions = {};
    renderOptions.name = shapeName;
    renderOptions.scale = {'x': 1, 'y': 1, 'z': 1};
    renderOptions.translation = {'x': 0, 'y': 0, 'z': 0};
    renderOptions.color = {'name': 'red', 'value': colorMap['red']};

    if (shapeName === "sphere") {
        renderOptions.rotation = {'x': 0, 'y': 0, 'z': 0};
        renderOptions.points = generateSphere();
    } else if (shapeName === "cylinder") {
        renderOptions.rotation = {'x': 30, 'y': 0, 'z': 0};
        renderOptions.points = generateCylinder();
    } else if (shapeName === "cone") {
        renderOptions.rotation = {'x': 15, 'y': 0, 'z': 0};
        renderOptions.points = generateCone();
    }
    return renderOptions;
}

function renderAll(renderOptionsList) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < renderOptionsList.length; i++) {
        renderShape(renderOptionsList[i]);
    }
}

function renderShape(options) {
    var transformationMatrix = createTransformationMatrix(options.rotation, options.translation, options.scale);

    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(options.points), gl.STATIC_DRAW );
    gl.uniformMatrix4fv(transMatrixUniform, false, flatten(transformationMatrix));

    var color = options.color.value;
    gl.uniform4f(colorUniform, color[0], color[1], color[2], color[3]);
    renderSolid(options.points.length);
    
    gl.uniform4f(colorUniform, 1.0, 1.0, 1.0, 1.0);
    renderWireframe(options.points.length);
}

function renderWireframe(numPoints) {
    for (var i = 0; i < numPoints; i+=3) {
        gl.drawArrays(gl.LINE_LOOP, i, 3);
    }
}

function renderSolid(numPoints) {
    gl.drawArrays(gl.TRIANGLES, 0, numPoints);
}

function createTransformationMatrix(rotation, translation, scale) {
    var m = mat4();
    var xRotDegrees = rotation['x'];
    var yRotDegrees = rotation['y'];
    var zRotDegrees = rotation['z'];

    var xRotMatrix = rotate(xRotDegrees, [1, 0, 0]);
    var yRotMatrix = rotate(yRotDegrees, [0, 1, 0]);
    var zRotMatrix = rotate(zRotDegrees, [0, 0, 1]);

    var rotationMatrix = mult(mult(xRotMatrix, yRotMatrix), zRotMatrix);

    var scaleMatrix = scalem(scale['x'], scale['y'], scale['z']);

    var translateMatrix = translate(translation['x'], translation['y'], translation['z']);

    return mult(translateMatrix, mult(scaleMatrix, rotationMatrix));
}

function generateCylinder() {
    var height = .3;
    var topY = height/2;
    var bottomY = topY - height;
    var radius = .15;

    var topCircle = generateCircle(radius, topY);
    var bottomCircle = generateCircle(radius, bottomY);
    var bottomCenter = vec4(0, bottomY, 0, 1);
    var topCenter = vec4(0, topY, 0, 1);

    var points = [];
    for (var i = 0; i < topCircle.length-1; i++) {
        points = points.concat([topCircle[i], bottomCircle[i], topCircle[i+1], bottomCircle[i], topCircle[i+1], bottomCircle[i+1], topCircle[i], topCenter, topCircle[i+1], bottomCircle[i], bottomCenter, bottomCircle[i+1]]);
    }
    return points;
}

function generateCone() {
    var height = .3;
    var tip = vec4(0, height/2, 0, 1);
    var radius = .15;

    var theta = 0;
    var y = tip[1] - height;
    var baseCenter = vec4(0, y, 0, 1);
    var basePoints = generateCircle(radius, y);

    var points = [];
    for (var i = 0; i < basePoints.length-1; i++) {
        points = points.concat([basePoints[i], tip, basePoints[i+1], basePoints[i], baseCenter, basePoints[i+1]]);
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
    var inc = 15;
    var r = .15;

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
