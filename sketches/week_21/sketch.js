var audioClient, blob;
var scene, camera, renderer, clock, geometry;
var frequencyData, freqAvg = 0;

var width = window.innerWidth,
    height = window.innerHeight;

var mesh, sprite, texture;
var dpr = window.devicePixelRatio;
var textureSize = 128 * dpr;
var vector = new THREE.Vector2();
var meshKnot, knot2;
var gui;
var SEPARATION = 80, AMOUNTX = 50, AMOUNTY = 50;
var particles, count = 0;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


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
    audioClient.loadFile("../../audio/visualmusic.wav")
        .then(init)
        .then(() => {
            audioClient.onAudioProcess(function () {
                frequencyData = audioClient.getFrequencyData();
                freqAvg = audioClient.getAverage(frequencyData);

                

                blob.mesh.rotation.x += 0.001;
                blob.mesh.rotation.y += 0.001;

                meshKnot.rotation.x += (freqAvg/500);
                meshKnot.rotation.y -= (freqAvg/1000);
                knot2.rotation.x += (freqAvg/500);
                knot2.rotation.y -= (freqAvg/1000);
                meshKnot.verticesNeedUpdate = true;
                knot2.verticesNeedUpdate = true;
                renderer.clear();

                blob.mesh.geometry.vertices.forEach((vertex) => {
                    const offset = blob.geometry.parameters.radius;
                    const amp = freqAvg/8;
                    const time = Date.now();
            
                    vertex.normalize();
            
                    var perlin = noise.simplex3(
                        vertex.x + (time * 0.0008),
                        vertex.y + (time * 0.0009),
                        vertex.z + (time * 0.0007),
                    );
            
                    const distance = offset + (perlin * amp);
            
                    vertex.multiplyScalar(distance);
                });

                blob.mesh.geometry.verticesNeedUpdate = true;
                blob.mesh.geometry.normalsNeedUpdate = true;
                blob.mesh.geometry.computeVertexNormals();
                blob.mesh.geometry.computeFaceNormals();






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
    // gui = new dat.GUI();
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

    blob = new Blob(scene);
    scene.add(blob.mesh);

    animate();

    createKnot();

    createGrid();

    document.getElementById("webgl").appendChild(renderer.domElement);
    // showControls();
    document.getElementsByClassName("loader-container")[0].style.visibility = "hidden";
}

function createGrid() {
    var numParticles = AMOUNTX * AMOUNTY;

	var positions = new Float32Array(numParticles * 3);
	var scales = new Float32Array(numParticles);

	var i = 0, j = 0;
	for (var ix = 0; ix < AMOUNTX; ix++) {
		for (var iy = 0; iy < AMOUNTY; iy++) {
			positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
			positions[i + 1] = 0; // y
			positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z
			scales[j] = 1;
			i += 3;
			j++;
		}
	}
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	geometry.addAttribute('scale', new THREE.BufferAttribute(scales, 1));
	var material = new THREE.ShaderMaterial({
		uniforms: {
			color: { value: new THREE.Color(0xffffff) },
		},
		vertexShader: document.getElementById('vertexshader').textContent,
		fragmentShader: document.getElementById('fragmentshader').textContent
	});

    particles = new THREE.Points(geometry, material);

    particles.position.setX(-70);
    particles.position.setY(-100);
    particles.position.setZ(-200);
    particles.rotation.x = 20;
    particles.rotation.y = 34;
    particles.rotation.z = -3;
    


    // gui.add(particles.position, 'x', -100, 100).step(10);
	// gui.add(particles.position, 'y', -100, 100).step(1);
    // gui.add(particles.position, 'z', -100, 100).step(1);

    // gui.add(particles.rotation, 'x', -100, 100).step(10);
	// gui.add(particles.rotation, 'y', -100, 100).step(1);
    // gui.add(particles.rotation, 'z', -100, 100).step(1);

	scene.add(particles);

}

function animate(timeStamp) {
    window.requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function createKnot() {

    var geoKnot = new THREE.TorusKnotBufferGeometry( 5, 2, 256, 32 );
    var matKnot = new THREE.MeshStandardMaterial( { color: 0xFF0094 } );

    meshKnot = new THREE.Mesh( geoKnot, matKnot );
    
    meshKnot.position.setX(blob.mesh.position.x + 70);

    knot2 = meshKnot.clone();
    knot2.position.setX(blob.mesh.position.x - 70);

    // gui.add(knot2.position, 'x', -100, 100).step(10);
	// gui.add(knot2.position, 'y', -100, 100).step(1);
    // gui.add(knot2.position, 'z', -100, 100).step(1);
    
    scene.add(meshKnot);
    scene.add(knot2);

}

document.getElementById("mute").onclick = function () {
    toggleMuteControl();
    audioClient.toggleSound();
}

document.getElementById("unmute").onclick = function () {
    toggleUnmuteControl();
    audioClient.toggleSound();
}

function Blob() {
    this.geometry = new THREE.IcosahedronGeometry(30, 5);
    this.material = new THREE.MeshStandardMaterial({
        color: '#0094FF',
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.4,
        opacity: 1,
        roughness: 0.2,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
}