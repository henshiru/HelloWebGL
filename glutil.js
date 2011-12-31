var glutil = function(){
  var that = {};
  // gets a WebGL context from |canvas|
  that.getGlContext = function(canvas) {
    var gl = null;
    try {
      gl = canvas.getContext("experimental-webgl");
    } catch (e) {
    }
    return gl;
  };

  // create a shader object with the script given by |id|
  that.createShader = function(gl, id) {
    var shaderScript = document.getElementById(id);
  
    if (!shaderScript) {
      return null;
    }
  
    // Walk through the source element's children, building the
    // shader source string.
    var theSource = "";
    var currentChild = shaderScript.firstChild;
  
    while(currentChild) {
      if (currentChild.nodeType == 3) {  // nodeType is text
        theSource += currentChild.textContent;
      }
      currentChild = currentChild.nextSibling;
    }
  
    // Now figure out what type of shader script we have,
    // based on its MIME type.
    var shader;
  
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;  // Unknown shader type
    }
    gl.shaderSource(shader, theSource);
    gl.compileShader(shader);
  
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("shader compile error: " + gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  };

  // Initialize the shaders, so WebGL knows how to light our scene.
  that.createProgram = function(gl, id_vertex, id_fragment) {
    var vertexShader = that.createShader(gl, id_vertex);
    var fragmentShader = that.createShader(gl, id_fragment);
  
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
  
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("shader link error: " + gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  };

  return that;
}();
