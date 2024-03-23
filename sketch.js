// Thanks to Daniel Shiffman for providing a template that got me UNSTUCK
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/151-ukulele-tuner.html
// https://youtu.be/F1OkDTUkKFo
// https://editor.p5js.org/codingtrain/sketches/8io2zvT03

// Also thanks to mathisfun.com
//https://www.mathsisfun.com/algebra/amplitude-period-frequency-phase-shift.html
//https://www.mathsisfun.com/polar-cartesian-coordinates.html#:~:text=Summary-,To%20convert%20from%20Polar%20Coordinates%20(r%2Cθ)%20to%20Cartesian,%3D%20r%20×%20sin(%20θ%20)

// Real coders may notice uneccessary code, but I'm learning and I'm proud of my progress.
// I'm open to feedback and suggestions.

// I created classes for polar and carestesian waves then got stuck on pitch detection.

// I found Shiffman's video to bail me out, but it ended up inspiring me to utilize the classes I had made.

const model_url = './crepe/'; // Local path to the model (follow shiffman's instructions for alternatives)
let pitch; 
let mic; 
let freq = 0; 
let threshold = 1; 
let amplitude = 0; 
let frequency = 100;
let phaseShift = 0; 
let verticalShift = 0;
let cartesianWave;
let polarWave;
let targetCartesianWave;
let targetPolarWave;
let isPitchDetected = false;

// Used Shiffmans exact syntax on these notes but changed the notes from ukulele to guitar
// I actually have a ukulele, but I use a guitar tuner more.
//Looked them up on wikipedia --> https://en.wikipedia.org/wiki/Guitar_tunings
let notes = [
  {
    note: 'E4',
    freq: 329.63
  },
  {
    note: 'B3',
    freq: 246.94
  },
  {
    note: 'G3',
    freq: 196.00
  },
  {
    note: 'D3',
    freq: 146.83
  },
  {
    note: 'A2',
    freq: 110.00
  },
  {
    note: 'E2',
    freq: 82.41
  }
];

// Setup function sets up canvas, audio input, waves (you), target waves (should be you) 
function setup() {
  createCanvas(windowWidth, windowHeight); // Creates a full screen canvas
  audioContext = getAudioContext(); // shifman said so
  mic = new p5.AudioIn(); // Creates a new audio input
  mic.start(listening); // Starts the audio input

  // Creates the objects for the waves rendered from the microphone input
  cartesianWave = new CartesianWave(amplitude, frequency, phaseShift, verticalShift);
  polarWave = new PolarWave(amplitude, frequency, phaseShift, verticalShift);

  // Creates the objects for the target waves rendered from the closest notes
  targetCartesianWave = new CartesianWave(100, frequency, phaseShift, verticalShift, color(255, 165, 0, 100));
  targetPolarWave = new PolarWave(100, frequency, phaseShift, verticalShift, color(255, 165, 0, 100));
}



function draw() {
  background(240, 160, 160);
  fill(255);
  
  // Gets the current amplitude of the microphone input
  amplitude = mic.getLevel();

  // Maps the amplitude to a desired range
  amplitude = map(amplitude, 0, 1, 0, 10000); // (not sure why these, impulsively added 0's)

  // Updates the wave with new frequency and amplitude
  updateWaveform(amplitude, freq / 16, phaseShift, verticalShift);

  // Draws the waves
  cartesianWave.draw();
  polarWave.draw();

  // Finds the closest note based on the detected frequency
  // 
  let closestNote = -1; // -1 means no note is detected
  let recordDiff = Infinity; // Big Number
  for (let i = 0; i < notes.length; i++) { // Loop through all the notes ( in our case, guitar strings)
    let diff = freq - notes[i].freq; // difference between detected freq and note freq (diff between guitar string and target note)
    if (abs(diff) < abs(recordDiff)) { // if difference is smaller than recorded difference
      closestNote = notes[i]; // set the nearest not to the note
      recordDiff = diff; // sets the recorded difference to the difference
      // If the difference between the detected frequency and
      // the preset note frequency is smaller than the previous difference,
      // then the closest not is the current note. I think. This is shiffman stuff
      // look up p5.js ukulele tuner
    }
  }

  // Draws the target waves for the closest note
  let targetFrequency = closestNote.freq / 16; // dropped the frequency for aesthetics
  updateTargetWaveform(amplitude, targetFrequency, phaseShift, verticalShift); 
  targetCartesianWave.draw();
  targetPolarWave.draw();

  // Displays the note name and frequency
textSize(32);
textAlign(CENTER, CENTER);
text(closestNote.note.charAt(0), width / 2, height - 50);

  // Determines whether to go up or down based on the frequency difference
  // Really realiant on shiffman
let frequencyDifference = freq - closestNote.freq;
  if (frequencyDifference > 0) {
    text("Go Down", width / 2, height - 20);
  } else if (frequencyDifference < 0) {
    text("Go Up", width / 2, height - 20);
  }
}
//more shiffman
function modelLoaded() {
  console.log('model loaded');
  pitch.getPitch(gotPitch);
}
// and... shiffman
function listening() {
  console.log('listening');
  pitch = ml5.pitchDetection(
    model_url,
    audioContext,
    mic.stream,
    modelLoaded
  );
}
// shi..ff.....m
function gotPitch(error, frequency) {
    if (error) {
        console.error(error);
    } else {
        if (frequency) {
            freq = frequency;
            isPitchDetected = true;  // Set the flag when a new pitch is detected
        }
        pitch.getPitch(gotPitch);
    }
}

// This was built from a Math is fun article linked at the top.
// Not all of the inputs are used, but I wanted to make a class of the entire wave.
// And add color
class CartesianWave {
  constructor(amplitude, frequency, phaseShift, verticalShift, color) {
    this.amplitude = amplitude * 1.5;
    this.frequency = frequency;
    this.phaseShift = phaseShift;
    this.verticalShift = verticalShift,
    this.color = color;
  }
  // This drawing way of drawing a wave is similar to an oscilloscope
  // I might have it backwards this might be the lissajous way (I think)
  draw() {
    push();
    translate(0, height / 2);
    beginShape();
    //noFill();
    fill(this.color);
    //fill(90, 190, 190, 100);
    stroke(0);
    strokeWeight(1);

    // The equation for a sine wave is y = A sin(B(x + C)) + D
    //The angle is the x value, and the y value is the result of the equation
    for (let x = 0; x < width; x++) { //This is the x axis
      let angle = this.frequency * (x / width * TWO_PI + this.phaseShift); // This is the angle
      let y = this.amplitude * sin(angle) + this.verticalShift; // This is the y value
      vertex(x, y); // This is the point on the graph. Drawn each time the loop runs and x advances
    }


    endShape();
    pop();
  }
}

// This is the polar version of the same waveforms
class PolarWave { 
  constructor(amplitude, frequency, phaseShift, verticalShift, color) {
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.phaseShift = phaseShift;
    this.verticalShift = verticalShift,
    this.color = color;
  }

  draw() {
    push();
    translate(width / 2, height / 2);
    beginShape();
    fill(this.color);
    //fill(90, 190, 190, 100);
    stroke(0);
    strokeWeight(1);
    
    // in polar coordinates, the angle is the x value and the radius is the y value
    for (let angle = 0; angle < TWO_PI; angle += 0.01) {
      let r = this.amplitude * 2 * sin(this.frequency * (angle + this.phaseShift)) + this.verticalShift; // radius
      let x = r * cos(angle); // x value
      let y = r * sin(angle); // y value
      vertex(x, y); // This point is drawm each iteration of the loop
    }
    endShape(CLOSE);
    pop();
  }
}

// Updates both waveforms with the new values
function updateWaveform(newA, newB, newC, newD) {
  cartesianWave = new CartesianWave(newA, newB, newC, newD, color(90, 190, 190, 100));
  polarWave = new PolarWave(newA, newB, newC, newD, color(90, 190, 190, 100));
}

// Updates the target waveforms with the new values
function updateTargetWaveform(newA, newB, newC, newD) {
  targetCartesianWave = new CartesianWave(newA, newB, newC, newD, color(255, 165, 0, 100));
  targetPolarWave = new PolarWave(newA, newB, newC, newD, color(255, 165, 0, 100));
}