function init() {
  var canvas = document.getElementById("canvas_main");

  var camera_distance = 10;
  var offset = transform.translate(0, 0, 0.3);
  var modelworld = offset;
  (function() {
    var left_pressed = false;
    var x = 0, y = 0;
    var rx = 0, ry = 0;
    canvas.addEventListener("mousedown", function(event) {
        if (event.button == 0) {
          left_pressed = true;
          x = event.clientX;
          y = event.clientY;
        }
      });
    canvas.addEventListener("mouseup", function(event) {
        if (event.button == 0)
          left_pressed = false;
      });
    canvas.addEventListener("mousemove", function(event) {
        if (left_pressed) {
          var kr = 0.01;
          var kc = 0.02;
          var dx = event.clientX - x;
          var dy = event.clientY - y;
          var min_camera_distance = 1.0;
          var max_camera_distance = 20.0;
          x = event.clientX;
          y = event.clientY;
          if (event.shiftKey) {
            camera_distance -= kc*dy;
            camera_distance = Math.max(camera_distance, min_camera_distance);
            camera_distance = Math.min(camera_distance, max_camera_distance);
          } else {
            rx += kr*dy;
            ry += kr*dx;
            modelworld = offset.multiply(transform.rotateY(ry)).multiply(
                transform.rotateX(rx));
          }
        }
      });
  })();
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
  var indices_buffer = gl.createBuffer();

  var data = [];
  var indices = [];
  var setData = function() {
    var W = 6;
    var H = 6;
    var X = 256;
    var Y = 256;
    var N = X*Y;
    var for_each = function(i0, i1, j0, j1, f) {
      var i, j;
      for (i = i0; i != i1; ++i)
        for (j = j0; j != j1; ++j)
          f(i, j);
    };
    // vertices
    for_each(0, Y, 0, X, function(i, j) {
        var f = function(x, y) {
          return 0.5*Math.sin(x*2)*Math.cos(y*2);
        };
        var x = W*(j/(X - 1) - 0.5);
        var y = H*(i/(Y - 1) - 0.5);
        var z = f(x, y);
        data.push(x);
        data.push(y);
        data.push(z);
      });
    // color
    for_each(0, Y, 0, X, function(i, j) {
        var z = data[(i*X + j)*3 + 2];
        data.push(0);
        data.push(0.8*(0.5 + z));
        data.push((0.5 + z));
      });
    // normal
    for_each(0, Y, 0, X, function(i, j) {
        var get_index = function(i, X) {
          if (i < 0)
            return 0;
          if (i >= X)
            return X - 1;
          return i;
        };
        var i0 = get_index(i - 1, X);
        var i1 = get_index(i + 1, X);
        var j0 = get_index(j - 1, Y);
        var j1 = get_index(j + 1, Y);
        var get_vector = function(i) {
          return transform.vector(data[i*3], data[i*3 + 1], data[i*3 + 2]);
        };
        var vx = get_vector(i*X + j1).sub(get_vector(i*X + j0));
        var vy = get_vector(i1*X + j).sub(get_vector(i0*X + j));
        var v = vy.cross(vx).normalize();
        data.push(v[0]);
        data.push(v[1]);
        data.push(v[2]);
      });
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    var locPosition = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(locPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locPosition);

    var locColor = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(locColor, 3, gl.FLOAT, false, 0, N*3*4);
    gl.enableVertexAttribArray(locColor);

    var locNormal = gl.getAttribLocation(program, "normal");
    gl.vertexAttribPointer(locNormal, 3, gl.FLOAT, false, 0, N*3*2*4);
    gl.enableVertexAttribArray(locNormal);

    // indices
    for_each(0, Y - 1, 0, X - 1, function(i, j) {
        indices.push(i*X + j);
        indices.push(i*X + j + 1);
        indices.push((i + 1)*X + j);

        indices.push((i + 1)*X + j);
        indices.push(i*X + j + 1);
        indices.push((i + 1)*X + j + 1);
      });
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
                  gl.STATIC_DRAW);
  };
  setData();

  var drawScene = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(gl.getUniformLocation(program, "ambient"), 0.2);
    gl.uniform3f(gl.getUniformLocation(program, "directional_light"),
                 0.1, -0.5, -0.5);

    var perspective = transform.perspective(
        Math.PI/4, canvas.width/canvas.height, 0.5, 25);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projection"), false,
                        perspective.toFloat32Array());

    var cameraview = transform.translate(0, 0, -camera_distance);
    var modelview = cameraview.multiply(modelworld);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelview"), false,
                        modelview.toFloat32Array());

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  };
  
  setInterval(drawScene, 16);
}