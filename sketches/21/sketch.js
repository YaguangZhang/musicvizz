var audioClient;
var scene, camera, renderer, clock, geometry;
var frequencyData, freqAvg = 0;

var width = window.innerWidth,
    height = window.innerHeight;

var vector = new THREE.Vector2();
var meshKnot;
var gui;


var startButton = document.getElementById('start-animate');
startButton.addEventListener('click', startClicked);

function startClicked() {
    document.getElementsByClassName("button-container")[0].style.visibility = "hidden";
    document.getElementsByClassName("loader-container")[0].style.visibility = "visible";
    beginAudioProcessing();
}

function beginAudioProcessing() {
    audioClient = new AudioHelper();
    audioClient.setupAudioProcessing();
    audioClient.loadFile("../../audio/upperwestside.mp3")
        .then(init)
        .then(() => {
            audioClient.onAudioProcess(function () {

                frequencyData = audioClient.getFrequencyData();
                freqAvg = audioClient.getAverage(frequencyData);

                meshKnot.rotation.x += (freqAvg/500);
                meshKnot.rotation.y -= (freqAvg/1000);
                meshKnot.verticesNeedUpdate = true;
                renderer.clear();

				camera.lookAt(scene.position);
				var positions = particles.geometry.attributes.position.array;
				var scales = particles.geometry.attributes.scale.array;
				var i = 0, j = 0;

				for (var ix = 0; ix < AMOUNTX; ix++) {
					for (var iy = 0; iy < AMOUNTY; iy++) {
						positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
							(Math.sin((iy + count) * 0.5) * 50);

						scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 8 +
							(Math.sin((iy + count) * 0.5) + 1) * 8;
						i += 3;
						j++;
					}
				}

				particles.geometry.attributes.position.needsUpdate = true;
				particles.geometry.attributes.scale.needsUpdate = true;
				renderer.render(scene, camera);

				count += (freqAvg * 0.005);
            });
        });
}

function init() {
    scene = new THREE.Scene();

    clock = new THREE.Clock();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 80;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    var ambientLight = new THREE.AmbientLight(0xffffff);
    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-100, 20, 30);

    camera.add(directionalLight);
    scene.add(ambientLight, camera);

    animate();

    createKnot();

    document.getElementById("webgl").appendChild(renderer.domElement);
    showControls();
    document.getElementsByClassName("loader-container")[0].style.visibility = "hidden";
}

function animate(timeStamp) {
    window.requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function createKnot() {
    var geoKnot = new THREE.TorusKnotBufferGeometry( 5, 2, 256, 32 );
    var matKnot = new THREE.MeshStandardMaterial( { color: 0xFF0094 } );
    meshKnot = new THREE.Mesh( geoKnot, matKnot );
    scene.add(meshKnot);
}

document.getElementById("mute").onclick = function () {
    toggleMuteControl();
    audioClient.toggleSound();
}

document.getElementById("unmute").onclick = function () {
    toggleUnmuteControl();
    audioClient.toggleSound();
}
