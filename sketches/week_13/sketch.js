var audioClient;
var scene, camera, renderer, clock;
var controls;
var colors;
var pinkDirectionalLight, blueDirectionalLight, ambientLight;
var count = 0;
var switchDirection, rotationZ = true;
var frameCount = 0;
var flip = true;
document.onreadystatechange = function () {
  if (document.readyState == "interactive") {
    audioClient = new AudioHelper();
    audioClient.setupAudioProcessing();
    audioClient.loadFile("../../audio/uandi.mp3")
    .then(init)
    .then(()=>{
      audioClient.onAudioProcess(function () {
        renderer.render(scene, camera);
        frameCount ++;
        var boxGrid = scene.getObjectByName("boxGrid");
        var timeElapsed = clock.getElapsedTime();
        var frequencyData = audioClient.getFrequencyData();
        var freqAvg = audioClient.getAverage(frequencyData);

        var h = count * 0.01 % 1;
        var s = 0.2;
        var l = 0.5;
        ambientLight.color.setHSL (h, s, l);

        boxGrid.children.forEach(function(child, index) {
          var k = 0;
          var scale = (frequencyData[k]) / 10000;
          console.log("scale: " + scale);
          child.scale.y += scale;
          k += (k < frequencyData.length ? 1 : 0);
        });
      });
    });
  }
};

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function init() {
  this.scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x145797 );
  this.clock = new THREE.Clock();

  colors = {
    "purple" : "#9F8AD6",
    "bright_pink" : "#F7488D",
    "light_pink" : "#F0B7DC",
    "blue" : "#65D3F8",
    "orange" : "#F6BD9E",
    "pink" : "#DB8ED6"
  };

  pinkDirectionalLight = getDirectionalLight(1, colors.pink);
  blueDirectionalLight = getDirectionalLight(2, colors.blue);

  var boxGrid = getBoxGrid(10, 10);
  boxGrid.name = "boxGrid";

  // var helper = new THREE.CameraHelper(pinkDirectionalLight.shadow.camera);
  ambientLight = getAmbientLight(2, colors.bright_pink);


  var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x0C056D, 0.6);
  hemisphereLight.position.x = 13;
  hemisphereLight.position.y = 10;
  hemisphereLight.position.z = 10;
  scene.add(hemisphereLight);

  var light = new THREE.DirectionalLight(0x590D82, 0.5);
  light.position.set(30, 10, 20);
  scene.add(light);

  var light2 = light.clone();
  light2.position.set(-30, 10, 20);
  scene.add(light2);

  // scene.add(pinkDirectionalLight);
  // scene.add(blueDirectionalLight);
  scene.add(boxGrid);
  // scene.add(helper);
  scene.add(ambientLight);

  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 1000);

  camera.position.x = 0;
  camera.position.y = 100;
  camera.position.z = 0;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  this.renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("webgl").appendChild(renderer.domElement);

  document.getElementsByClassName("loader-container")[0].style.visibility = "hidden";
  showControls();

};

function getSystem() {
  // Setup particle geometry
  var geometry = new THREE.SphereGeometry(10, 48, 48);
  
  geometry.vertices.forEach(function (vertex) {
    vertex.x += (Math.random() - 0.5);
    vertex.y += (Math.random() - 0.5);
    vertex.z += (Math.random() - 0.5);
  });

  var particleMat = new THREE.PointsMaterial({
    color: "#FFFFFF",
    size: 0.25,
    map: new THREE.TextureLoader().load("../week_07/particle.jpg"),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  var particleSystem = new THREE.Points(
    geometry,
    particleMat
  );

  return particleSystem;

}


function getBox(w, h, d, col) {
  var geometry = new THREE.BoxGeometry(w, h, d);
  var material = new THREE.MeshPhongMaterial({
    color: col
  });
  var mesh = new THREE.Mesh(
    geometry,
    material
  );
  mesh.castShadow = true;
  return mesh;
}

function getBoxGrid(amount, separationMultiplier) {
  var group = new THREE.Group();
  for (var i=0; i<amount; i++) {
    // var col = i%2 == 0 ? colors.pink : colors.bright_pink;
    // var obj = getBox(1, 1, 1, col);
    var obj = getSystem();
    // var obj = getsystem.geometry;
    obj.position.x = i * separationMultiplier;
    // obj.position.y = obj.geometry.parameters.height/2;
    obj.position.y = i * separationMultiplier;
    group.add(obj);
    for (var j=1; j<amount; j++) {
      // var col = j%2 == 0 ? colors.pink : colors.bright_pink;
      // var obj = getBox(1, 1, 1, col);
      var obj = getSystem();
      obj.position.x = i * separationMultiplier;
      // obj.position.y = obj.geometry.parameters.height/2;
      obj.position.y = i * separationMultiplier;
      obj.position.z = j * separationMultiplier;
      group.add(obj);
    }
  }
  group.position.x = -(separationMultiplier * (amount-1))/2;
  group.position.z = -(separationMultiplier * (amount-1))/2;
  return group;
}

function getPointLight(intensity, color) {
  var light = new THREE.PointLight(color, intensity);
  light.castShadow = true;
  return light;
}

function getSpotLight(intensity, color) {
  var light = new THREE.SpotLight(color, intensity);
  light.castShadow = true;
  light.shadow.bias = 0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  return light;
}

function getDirectionalLight(intensity, color) {
  var light = new THREE.DirectionalLight(color, intensity);
  light.castShadow = true;
  light.shadow.camera.left = -10;
  light.shadow.camera.bottom = -10;
  light.shadow.camera.right = 10;
  light.shadow.camera.top = 10;
  return light;
}

function getAmbientLight(intensity, color) {
  var light = new THREE.AmbientLight(color, intensity);
  light.name = "ambient-light";
  return light;
}

document.getElementById("mute").onclick = function() {
  toggleMuteControl();
  audioClient.toggleSound();
}

document.getElementById("unmute").onclick = function() {
  toggleUnmuteControl();
  audioClient.toggleSound();
}
