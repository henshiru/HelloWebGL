var transform = function(){
  var that = {};

  var vector = function(x, y, z) {
    x = x || 0;
    y = y || 0;
    z = z || 0;
    var v = [x, y, z];
    v.copy = function() {
      return vector(v[0], v[1], v[2]);
    };
    v.abs2 = function() {
      return v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
    };
    v.abs = function() {
      return Math.sqrt(v.abs2());
    };
    v.dot = function(v2) {
      return v[0]*v2[0] + v[1]*v2[1] + v[2]*v2[2];
    };
    v.cross = function(v2) {
      return vector(v[1]*v2[2] - v[2]*v2[1],
                    v[2]*v2[0] - v[0]*v2[2],
                    v[0]*v2[1] - v[1]*v2[0]);
    };
    v.multiply = function(k) {
      v[0] *= k;
      v[1] *= k;
      v[2] *= k;
      return v;
    };
    v.add = function(v2) {
      v[0] += v2[0];
      v[1] += v2[1];
      v[2] += v2[2];
      return v;
    };
    v.sub = function(v2) {
      v[0] -= v2[0];
      v[1] -= v2[1];
      v[2] -= v2[2];
      return v;
    };
    v.normalize = function() {
      return v.multiply(1.0/v.abs());
    };
    return v;
  };
  that.vector = vector;
 
  var matrix = function() {
    var m = [[0, 0, 0, 0],
             [0, 0, 0, 0],
             [0, 0, 0, 0],
             [0, 0, 0, 0]];

    var multiply = function(mat2) {
      var t = matrix();
      var i, j;
      for (i = 0; i != 4; ++i) {
        for (j = 0; j != 4; ++j) {
          t[i][j] = m[i][0]*mat2[0][j] + m[i][1]*mat2[1][j] +
              m[i][2]*mat2[2][j] + m[i][3]*mat2[3][j];
        }
      }
      return t;
    };
    var toFloat32Array = function() {
      var a = new Float32Array(16);
      var i, j;
      for (i = 0; i != 4; ++i) {
        for (j = 0; j != 4; ++j) {
          a[j*4 + i] = m[i][j];
        }
      }
      return a;
    };
    m.multiply = multiply;
    m.toFloat32Array = toFloat32Array;
    return m;
  };
  that.matrix = matrix;
  that.zero = that.matrix;

  that.identity = function() {
    var m = that.zero();
    m[0][0] = m[1][1] = m[2][2] = m[3][3] = 1;
    return m;
  };

  that.perspective = function(fovy, aspect, nearZ, farZ) {
    // See http://www.songho.ca/opengl/gl_projectionmatrix.html for details.
    var m = that.zero();
    var tan_fovy = Math.tan( fovy );
    m[0][0] = 1 / (aspect*tan_fovy);
    m[1][1] = 1 / tan_fovy;
    m[2][2] = -(nearZ + farZ) / (farZ - nearZ);
    m[2][3] = -2.0 * nearZ * farZ / (farZ - nearZ);
    m[3][2] = -1.0;
    return m;
  };

  that.rotateX = function(t) {
    var m = that.zero();
    var s = Math.sin(t);
    var c = Math.cos(t);
    m[0][0] = 1;
    m[1][1] = c;
    m[1][2] = -s;
    m[2][1] = s;
    m[2][2] = c;
    m[3][3] = 1;
    return m;
  };

  that.rotateY = function(t) {
    var m = that.zero();
    var s = Math.sin(t);
    var c = Math.cos(t);
    m[0][0] = c;
    m[0][2] = s;
    m[1][1] = 1;
    m[2][0] = -s;
    m[2][2] = c;
    m[3][3] = 1;
    return m;
  };

  that.rotateZ = function(t) {
    var m = that.zero();
    var s = Math.sin(t);
    var c = Math.cos(t);
    m[0][0] = c;
    m[0][1] = -s;
    m[1][0] = s;
    m[1][1] = c;
    m[2][2] = 1;
    m[3][3] = 1;
    return m;
  };

  that.translate = function(x, y, z) {
    var m = that.identity();
    m[0][3] = x;
    m[1][3] = y;
    m[2][3] = z;
    return m;
  };

  return that;
}();
