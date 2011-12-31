function init() {
  var canvas = document.getElementById("canvas_main");
  var gl = glutil.getGlContext(canvas);
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.cullFace(gl.BACK);
  gl.enable(gl.CULL_FACE);

  var program = glutil.createProgram(gl, "vshader", "fshader");
  gl.useProgram(program);

  var buffer = gl.createBuffer();

  var drawScene = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(gl.getUniformLocation(program, "ambient"), 0.2);
    gl.uniform3f(gl.getUniformLocation(program, "directional_light"),
                 0, 0.5, 0);

    var perspective = transform.perspective(
        Math.PI/3, canvas.width/canvas.height, 1, 10);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false,
                        perspective.toFloat32Array());

    var modelview = transform.translate(0, 0, -4).multiply(
        transform.rotateX(Math.PI*2*((new Date).getTime())/2000));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelview"), false,
                        modelview.toFloat32Array());

    var vertices = [1.0,  1.0,  0.0,
                    -1.0, 1.0,  0.0,
                    1.0,  -1.0, 0.0,
                    -1.0, -1.0, 0.0,
                    ];
    var colors = [1.0, 0.0, 0.0,
                  0.0, 1.0, 0.0,
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 0.0,
                  ];
    var normals = [0.0, 0.0, 1.0,
                   0.0, 0.0, 1.0,
                   0.0, 0.0, 1.0,
                   0.0, 0.0, 1.0,
                   ];
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);  
    gl.bufferData(gl.ARRAY_BUFFER,
                  new Float32Array(vertices.concat(colors).concat(normals)),
                  gl.STATIC_DRAW);

    var N = vertices.length/3;
  
    var locPosition = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(locPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locPosition);

    var locColor = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(locColor, 3, gl.FLOAT, false, 0, N*3*4);
    gl.enableVertexAttribArray(locColor);

    var locNormal = gl.getAttribLocation(program, "normal");
    gl.vertexAttribPointer(locNormal, 3, gl.FLOAT, false, 0, N*3*2*4);
    gl.enableVertexAttribArray(locNormal);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  
  setInterval(drawScene, 16);
}