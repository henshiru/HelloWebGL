var gl = null;
var program = null;
var canvas = null;
var buffer = null;

function onLoad() {
  canvas = document.getElementById("canvas_main");
  gl = glutil.getGlContext(canvas);
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.cullFace(gl.BACK);
  gl.enable(gl.CULL_FACE);

  program = glutil.createProgram(gl, "vshader", "fshader");
  gl.useProgram(program);

  buffer = gl.createBuffer();

  setInterval(drawScene, 15);
}

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var locTransform = gl.getUniformLocation(program, "transform");
  var matrix = transform.identity();
  matrix = transform.multiply(transform.rotateY(Math.PI*2*((new Date).getTime())/2000), matrix);
  matrix = transform.multiply(transform.translate(0, 0, -4), matrix);
  matrix = transform.multiply(transform.perspective(Math.PI/3, canvas.width/canvas.height, 1, 10), matrix);
  gl.uniformMatrix4fv(locTransform, false, transform.toFloat32Array(matrix));

  var vertices = [  
      1.0,  1.0,  0.0,
      -1.0, 1.0,  0.0,
      1.0,  -1.0, 0.0,
      -1.0, -1.0, 0.0
  ];
  var colors = [
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0,
      0.0, 0.0, 0.0,
  ];
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.concat(colors)), gl.STATIC_DRAW);
  
  var locPosition = gl.getAttribLocation(program, "position");
  gl.vertexAttribPointer(locPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(locPosition);

  var locColor = gl.getAttribLocation(program, "color");
  gl.vertexAttribPointer(locColor, 3, gl.FLOAT, false, 0, vertices.length*4);
  gl.enableVertexAttribArray(locColor);
  

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}