var audioClient;
var frequencyData, freqAvg = 0;

const circleCount = 150;
const circlePropCount = 8;
const circlePropsLength = circleCount * circlePropCount;
const baseTTL = 150;
const rangeTTL = 200;
const baseRadius = 150;
const xOff = 0.0015;
const yOff = 0.0015;
const zOff = 0.0015;

let colors = [
    [214, 22, 49],
    [29, 31, 65],
    [356, 42, 69],
    [35, 64, 67],
    [195, 48, 50],
    [149, 36, 73],
    [222, 25, 44],
    [1, 47, 80],
    [51, 66, 69],
    [30, 3, 52]
];

var gui;
let container;
let canvas;
let ctx;
let circles;
let circleProps;
let simplex;
let baseHue;
var col;

var startButton = document.getElementById('start-animate');
startButton.addEventListener('click', startClicked);

function startClicked() {
    document.getElementsByClassName("button-container")[0].style.visibility = "hidden";
    beginAudioProcessing();
}

function beginAudioProcessing() {
    audioClient = new AudioHelper();
    audioClient.setupAudioProcessing();
    audioClient.loadFile("../../audio/everythingwanted.mp3")
        .then(init)
        .then(() => {
            audioClient.onAudioProcess(function () {
                frequencyData = audioClient.getFrequencyData();
                freqAvg = audioClient.getAverage(frequencyData);
                
            });
        });
}

function init() {
    createCanvas();
    resize();
    initCircles();
    draw();
    showControls();
}

function resize() {
    const { innerWidth, innerHeight } = window;
    
    canvas.a.width = innerWidth;
    canvas.a.height = innerHeight;
    
    ctx.a.drawImage(canvas.b, 0, 0);
    
    canvas.b.width = innerWidth;
    canvas.b.height = innerHeight;
    
    ctx.b.drawImage(canvas.a, 0, 0);
}

document.getElementById("mute").onclick = function () {
    toggleMuteControl();
    audioClient.toggleSound();
}

document.getElementById("unmute").onclick = function () {
    toggleUnmuteControl();
    audioClient.toggleSound();
}

function initCircles() {
  circleProps = new Float32Array(circlePropsLength);
  simplex = new SimplexNoise();
  baseHue = 255;

  let i;

  for (i = 0; i < circlePropsLength; i += circlePropCount) {
    initCircle(i);
  }
}

function initCircle(i) {
  let x, y, n, t, speed, vx, vy, life, ttl, radius, hue, index;

  x = rand(canvas.a.width);
  y = rand(canvas.a.height);
  n = simplex.noise3D(x * xOff, y * yOff, zOff);
  t = rand(TAU);
  
  speed = freqAvg/10;

  vx = speed * cos(t);
  vy = speed * sin(t);
  life = 0;
  ttl = baseTTL + rand(rangeTTL);
  
  var factor = abs((30 - freqAvg) * 10);
  radius = baseRadius + factor;

  index = Math.floor((Math.random()*colors.length));

  circleProps.set([x, y, vx, vy, life, ttl, radius, index], i);
}

function updateCircles() {
  let i;

  baseHue++;

  for (i = 0; i < circlePropsLength; i += circlePropCount) {
    updateCircle(i);
  }
}

function updateCircle(i) {
  let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i;
  let x, y, vx, vy, life, ttl, radius, hue, index;

  x = circleProps[i];
  y = circleProps[i2];
  vx = circleProps[i3];
  vy = circleProps[i4];
  life = circleProps[i5];
  ttl = circleProps[i6];
  radius = circleProps[i7];
  index = circleProps[i8];

  drawCircle(x, y, life, ttl, radius, index);

  life++;

  circleProps[i] = x + vx;
  circleProps[i2] = y + vy;
  circleProps[i5] = life;

  (checkBounds(x, y, radius) || life > ttl) && initCircle(i);
}

function drawCircle(x, y, life, ttl, radius, colorIndex) {
  ctx.a.save();
  
  let circleColor = colors[colorIndex];
  ctx.a.fillStyle = `hsla(${circleColor[0]},${circleColor[1]}%,${circleColor[2]}%,${fadeInOut(life,ttl)})`;

  ctx.a.beginPath();
  ctx.a.arc(x,y, radius, 0, TAU);
  ctx.a.fill();
  ctx.a.closePath();
  ctx.a.restore();
}

function checkBounds(x, y, radius) {
  return (
    x < -radius ||
    x > canvas.a.width + radius ||
    y < -radius ||
    y > canvas.a.height + radius
  );
}

function createCanvas() {
  container = document.querySelector('.webgl');
	canvas = {
		a: document.createElement('canvas'),
		b: document.createElement('canvas')
	};
	canvas.b.style = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	`;
	container.appendChild(canvas.b);
	ctx = {
		a: canvas.a.getContext('2d'),
		b: canvas.b.getContext('2d')
	};
}

function render() {
  ctx.b.save();
  ctx.b.filter = 'blur(50px)';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function draw() {
  ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
  ctx.b.fillRect(0, 0, canvas.b.width, canvas.b.height);
  updateCircles();
  render();
  window.requestAnimationFrame(draw);
}