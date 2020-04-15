# Music Visualizations

[![License: MIT License](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/MIT)

## Installation
1. Clone Repository
2. `cd` into directory
3. Run `python -m SimpleHTTPServer` (with Python 2) or `python -m http.server` (with Python 3)
4. Go to `localhost:8000` in your browser

## Demo
<div>
<img style="float:left" src="img/demo1.gif?raw=true">
<img style="float:left" src="img/demo2.gif?raw=true">
</div>
<div>
<img style="float:left" src="img/demo4.gif?raw=true">
<img style="float:left" src="img/demo3.gif?raw=true">
</div>
<div style="text-align:center;">Checkout all the sketches at <b><i><a target="_blank" href ="http://musicvizz.com/">musicvizz.com</a></i></b></div>

## How to visualize custom audios locally?
1. Install and run the demo page locally
2. Find the index number of the effect to use in the demo url (`.../sketches/[effect index]/index.html`)
3. Copy the desired custom audio file to `musicvizz/audio/`
4. Modify the corresponding script under `musicvizz/sketches/[effect index]/sketch.js` so that `audioClient.loadFile` has the relative directory of the desired audio file as input
5. Run the corresponding demo page with clear cache at `localhost:8000` (with Chrome, one can do a shift-refresh to bypass the cache)

## Credits
- [three.js](https://p5js.org/)
- [p5.js](https://p5js.org/)
- [Web Audio API](https://webaudio.github.io/web-audio-api/)