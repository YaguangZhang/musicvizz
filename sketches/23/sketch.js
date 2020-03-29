
var audioClient;
var scene, camera, renderer, clock, spring;
var frequencyData, freqAvg = 0;
var width = window.innerWidth,
    height = window.innerHeight;
var system, emitter, color1, color2;
var time;
var startButton = document.getElementById('start-animate');
var gui;

startButton.addEventListener('click', startClicked, { passive: false });

function startClicked() {
    document.getElementsByClassName("button-container")[0].style.visibility = "hidden";
    beginAudioProcessing();
}

function beginAudioProcessing() {
    audioClient = new AudioHelper();
    audioClient.setupAudioProcessing();
    audioClient.loadFile("../../audio/magnolia.mp3")
        .then(init)
        .then(() => {
            audioClient.onAudioProcess(function () {
                frequencyData = audioClient.getFrequencyData();
                freqAvg = audioClient.getAverage(frequencyData);
            });
        });
}

function init() {
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        1,
        1000
    );
    camera.position.z = 500;
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 1, 10000);

    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    addLights();
    addProton();
    animate();
    showControls();
}

function addLights() {
    var ambientLight = new THREE.AmbientLight(0x101010);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
    pointLight.position.set(0, 200, 200);
    scene.add(pointLight);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function addProton() {
    system = new Nebula.default();
    emitter = new Nebula.Emitter();
    color1 = new THREE.Color();
    color2 = new THREE.Color();
    emitter
        .setRate(
            new Nebula.Rate(new Nebula.Span(4, 16), new Nebula.Span(0.01))
        )
        .setInitializers([
            new Nebula.Position(new Nebula.PointZone(0, 0)),
            new Nebula.Mass(1),
            new Nebula.Radius(6, 12),
            new Nebula.Body(createSprite()),
            new Nebula.Life(3),
            new Nebula.RadialVelocity(45, new Nebula.Vector3D(0, 1, 0), 180),
        ])
        .setBehaviours([
            new Nebula.Alpha(1, 0),
            new Nebula.Scale(0.1, 1.3),
            new Nebula.Color(color1, color2),
        ]);

    system.addEmitter(emitter.emit());
    system.addRenderer(new Nebula.SpriteRenderer(scene, THREE));
}

function updateEmitterVisuals() {
    var white = color1;
    var yellow = new THREE.Color(0xFCDCA8);
    var blue = new THREE.Color(0x5CB4AB);

    var colors = [white, yellow, blue];
    var scale = (freqAvg / 50);

    var num =  Math.ceil(scale * 100) / 100;
    // console.log("num: " + num);
    console.log("avg" + freqAvg/50);

    var col = colors[Math.floor(Math.random() * colors.length)]

    emitter.setBehaviours([
        new Nebula.Alpha(0, 1),
        new Nebula.Scale(0.1, scale),
        new Nebula.Color(color1, col),
    ]);
}

function createSprite() {
    var map = new THREE.TextureLoader().load('dot.png');
    var material = new THREE.SpriteMaterial({
        map: map,
        color: 0xff0000,
        blending: THREE.AdditiveBlending,
        fog: true,
        visible: true,
    });
    return new THREE.Sprite(material);
}

var ctha = 0;

function render() {
    system.update();
    renderer.render(scene, camera);
    camera.lookAt(scene.position);
    ctha += 0.01;

    var temp = freqAvg * 10;
    var lol = Math.ceil(temp / 10) * 10

    updateEmitterVisuals();
    camera.position.x = Math.sin(ctha) * 350;
    camera.position.z = Math.cos(ctha) * 350;
    camera.position.y = Math.sin(ctha) * 350;
}

var tha = 0;

document.getElementById("mute").onclick = function () {
    toggleMuteControl();
    audioClient.toggleSound();
}

document.getElementById("unmute").onclick = function () {
    toggleUnmuteControl();
    audioClient.toggleSound();
}