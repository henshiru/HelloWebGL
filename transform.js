
var transform = {};

transform.zero = function() {
  return [[0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0]];
};

transform.identity = function() {
  var m = transform.zero();
  m[0][0] = m[1][1] = m[2][2] = m[3][3] = 1;
  return m;
};

transform.perspective = function(fovy, aspect, nearZ, farZ) {
  var frust = transform.zero();
  var tan_fovy = Math.tan( fovy );
  frust[0][0] = 1 / (aspect*tan_fovy);
  frust[1][1] = 1 / tan_fovy;
  frust[2][2] = -(nearZ + farZ) / (farZ - nearZ);
  frust[2][3] = -2.0 * nearZ * farZ / (farZ - nearZ);
  frust[3][2] = -1.0;
  return frust;
};

transform.multiply = function(mat1, mat2) {
  var m = transform.zero();
  var i, j;
  for (i = 0; i != 4; ++i) {
    for (j = 0; j != 4; ++j) {
      m[i][j] = mat1[i][0]*mat2[0][j] + mat1[i][1]*mat2[1][j] + mat1[i][2]*mat2[2][j] + mat1[i][3]*mat2[3][j];
    }
  }
  return m;
};

transform.rotateX = function(t) {
  var m = transform.zero();
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

transform.rotateY = function(t) {
  var m = transform.zero();
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

transform.rotateZ = function(t) {
  var m = transform.zero();
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

transform.translate = function(x, y, z) {
  var m = transform.identity();
  m[0][3] = x;
  m[1][3] = y;
  m[2][3] = z;
  return m;
};

transform.toFloat32Array = function(m) {
  var a = new Float32Array(16);
  var i, j;
  for (i = 0; i != 4; ++i) {
    for (j = 0; j != 4; ++j) {
      a[j*4 + i] = m[i][j];
    }
  }
  return a;
};
