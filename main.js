var gl = null;
var program = null;

function onLoad() {
  var canvas = document.getElementById("canvas_main");
  gl = glutil.getGlContext(canvas);
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  program = glutil.createProgram(gl, "vshader", "fshader");
  gl.useProgram(program);

  setInterval(drawScene, 15);
}

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var verticesBuffer = gl.createBuffer();  
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);  
  var vertices = [  
      1.0,  1.0,  0.0,
      -1.0, 1.0,  0.0,
      1.0,  -1.0, 0.0,
      -1.0, -1.0, 0.0
  ];  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  //gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  var locPosition = gl.getAttribLocation(program, "position");
  gl.vertexAttribPointer(locPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(locPosition);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}