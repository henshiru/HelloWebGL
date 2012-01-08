function init() {
  var canvas = document.getElementById("canvas_main");

  var camera_distance = 10;
  var offset = transform.translate(0, 0, 0.3);
  var modelworld;
  // Event handlers.
  (function() {
    var left_pressed = false;
    var x = 0, y = 0;
    var rx = 0, ry = 0;
    var get_modelworld = function() {
      return offset.multiply(transform.rotateY(ry)).multiply(
          transform.rotateX(rx));
    };
    modelworld = get_modelworld();
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
            modelworld = get_modelworld();
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
  var buffer = gl.createBuffer();
  var indices_buffer = gl.createBuffer();

  var X = 256;
  var Y = 256;
  var N = X*Y;
  var data = [];
  var indices = [];
  var setData = function() {
    gl.useProgram(program);
    var W = 6;
    var H = 6;
    var for_each = function(i0, i1, j0, j1, f) {
      var i, j;
      for (i = i0; i != i1; ++i)
        for (j = j0; j != j1; ++j)
          f(i, j);
    };
    // vertices
    for_each(0, Y, 0, X, function(i, j) {
        var f = function(x, y) {
          x *= 2/3;
          y *= 2/3;
          var sq = function(x) { return x*x; };
          var cb = function(x) { return x*x*x; };
          var absx = Math.abs(x);
          var exp = Math.exp;
          var t = sq(absx - 1) + sq(y);
          var z = 0;
          z += 6*exp(-(t + 1/3*cb(y + 1/2)));
          z += 2/3*exp(-exp(11)*sq(t));
          z += y - sq(sq(x));
          z /= 8;
          return z;
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
        data.push(1.0);
        data.push(1.0);
        data.push(1.0);
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

  var program_aa = glutil.createProgram(gl, "vshader_aa", "fshader_aa");
  
  var drawScene = function() {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);  

    var locPosition = gl.getAttribLocation(program, "position");
    gl.vertexAttribPointer(locPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locPosition);

    var locColor = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(locColor, 3, gl.FLOAT, false, 0, N*3*4);
    gl.enableVertexAttribArray(locColor);

    var locNormal = gl.getAttribLocation(program, "normal");
    gl.vertexAttribPointer(locNormal, 3, gl.FLOAT, false, 0, N*3*2*4);
    gl.enableVertexAttribArray(locNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);

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

  var buffer_aa = gl.createBuffer();
  var framebuffer = gl.createFramebuffer();
  var framebuffer_width = canvas.width*4;
  var framebuffer_height = canvas.height*4;
  var texture = gl.createTexture();
  var renderbuffer = gl.createRenderbuffer();
  var prepareTexture = function() {
    gl.useProgram(program_aa);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebuffer_width,
                  framebuffer_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,
                           framebuffer_width, framebuffer_height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                            gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
                               gl.RENDERBUFFER, renderbuffer);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var data = [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0,
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_aa);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  };
  prepareTexture();

  var drawTexture = function() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0, 0, framebuffer_width, framebuffer_height);
    drawScene();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    gl.useProgram(program_aa);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer_aa);
    var locPosition = gl.getAttribLocation(program_aa, "position");
    gl.vertexAttribPointer(locPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locPosition);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program_aa, "texture"), 0);

    gl.uniform2f(gl.getUniformLocation(program_aa, "texture_size"),
                 framebuffer_width, framebuffer_height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  setInterval(drawTexture, 16);
}
