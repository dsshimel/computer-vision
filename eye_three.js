var ws = new WebSocket('ws://localhost:7777');

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

var scene = new THREE.Scene();
var ambientLight = new THREE.AmbientLight(0xbbbbbb);
scene.add(ambientLight);
var pointLight = new THREE.PointLight(0xaaaaaa, 1, 100);
scene.add(pointLight);
var camera = new THREE.PerspectiveCamera(45 /* fov */, windowWidth / windowHeight, 0.1, 1000);

var sceneCanvas = document.getElementById('scene');

var renderer = new THREE.WebGLRenderer({canvas: sceneCanvas});
renderer.setSize(windowWidth, windowHeight);

var feedHeight = null;
var feedWidth = null;
var canvasFeedHeightRatio = null;
var canvasFeedWidthRatio = null;

var sphere = new THREE.SphereGeometry(/* radius=*/ 10, 1, 1);
// var circle = new THREE.CircleGeometry(/* radius= */ 100, /* segments= */ 64)
var material = new THREE.MeshLambertMaterial({color: 0xaff00ff});
// var circleMaterial = new THREE.LineBasicMaterial({color: 0x00ff00});
var mesh = new THREE.Mesh(sphere, material);
// var circleLine = new THREE.Line(circle, circleMaterial);
scene.add(mesh);
// scene.add(circleLine);
// mesh.position.set(windowWidth / 2, windowHeight / 2, /* z= */ 0);
mesh.position.set(0, 0, /* z= */ 0);
// circleLine.position.set(0, 0, /* z= */ 0);
camera.position.z = 1000;

var vFOV = THREE.Math.degToRad(camera.fov); // convert vertical fov to radians
var camHeight = 2 * Math.tan(vFOV / 2) * (camera.position.z); // visible height
var camWidth = camHeight * camera.aspect;
console.log(camHeight + ', ' + camWidth);

ws.onopen = function() {
  console.log('connection opened');
};

ws.onclose = function() {
  console.log('connection closed');
};

ws.onmessage = function(event) {
  var data = JSON.parse(event.data);
  if(!feedHeight && !feedWidth) {
    feedHeight = parseInt(data['height']);
    feedWidth = parseInt(data['width']);
    console.log('height: ' + feedHeight + ', width: ' + feedWidth);
    canvasFeedWidthRatio = camWidth / feedWidth;
    canvasFeedHeightRatio = camHeight / feedHeight;
  } else {
    var mX = data['m_x'];
    var mY = data['m_y'];
    if (!mX || !mY) {
      return;
    }
    // console.log(mX + ', ' + mY);
    var x = -1 * ((mX - (feedWidth / 2)) * canvasFeedWidthRatio);
    var y = -1 * ((mY - (feedHeight / 2)) * canvasFeedHeightRatio);
    console.log(x + ', ' + y);
    mesh.position.set(x, y, /* z= */ 0);
  }
};

(function render() {
  // console.log('in render loop');
  requestAnimationFrame(render);
  renderer.render(scene, camera);
})();