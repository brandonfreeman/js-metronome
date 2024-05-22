// Create an HTML structure for the metronome with modern, responsive design
const metronomeHtml = `
  <style>
    /* General styles */
    body {
      font-family: 'Arial', sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f0f0f0;
      margin: 0;
    }
    
    .container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      width: 90%;
      max-width: 500px;
      text-align: center;
    }

    .control-group {
      margin-bottom: 15px;
    }

    .control-group label {
      display: block;
      font-size: 1.2em;
      margin-bottom: 5px;
    }

    .control-group input[type="number"],
    .control-group input[type="range"] {
      width: 100%;
      padding: 10px;
      font-size: 1em;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .control-group input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      height: 10px;
      background: #ddd;
      outline: none;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .control-group input[type="range"]:hover {
      opacity: 1;
    }

    .control-group input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: #4CAF50;
      cursor: pointer;
    }

    .control-group input[type="range"]::-moz-range-thumb {
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: #4CAF50;
      cursor: pointer;
    }

    .radio-group {
      display: flex;
      justify-content: center;
      gap: 10px;
    }

    .radio-group input[type="radio"] {
      display: none;
    }

    .radio-group label {
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1em;
    }

    .radio-group input[type="radio"]:checked + label {
      background-color: #45a049;
    }

    #startStopButton {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 15px 20px;
      font-size: 1.2em;
      cursor: pointer;
      border-radius: 5px;
      width: 100%;
    }

    #startStopButton:hover {
      background-color: #45a049;
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .container {
        width: 95%;
        padding: 15px;
      }

      .control-group label,
      .radio-group label {
        font-size: 1.1em;
      }
    }

    @media (max-width: 480px) {
      .control-group label,
      .radio-group label {
        font-size: 1em;
      }

      #startStopButton {
        padding: 10px;
        font-size: 1em;
      }
    }
  </style>
  <div class="container">
    <div class="control-group">
      <label for="timeSignatureTop">Time Signature (Top): </label>
      <input type="number" id="timeSignatureTop" min="1" value="4">
    </div>
    <div class="control-group">
      <label for="timeSignatureBottom">Time Signature (Bottom): </label>
      <input type="number" id="timeSignatureBottom" min="1" value="4">
    </div>
    <div class="control-group">
      <label for="tempo">Tempo (BPM): </label>
      <input type="number" id="tempo" min="30" max="300" value="120">
    </div>
    <div class="control-group">
      <label for="gain">Gain: </label>
      <input type="range" id="gain" min="0" max="1" step="0.01" value="0.5">
    </div>
    <div class="control-group radio-group">
      <input type="radio" id="tone" name="soundType" value="tone" checked>
      <label for="tone">Tone</label>
      <input type="radio" id="click" name="soundType" value="click">
      <label for="click">Click</label>
    </div>
    <button id="startStopButton">Start</button>
  </div>
`;

// Append the HTML structure to the output cell
const output = document.createElement('div');
output.innerHTML = metronomeHtml;
document.body.appendChild(output);

// Metronome functionality
let audioContext = null;
let gainNode = null;
let intervalId = null;

document.getElementById('startStopButton').addEventListener('click', () => {
  if (audioContext === null) {
    // Initialize audio context and gain node
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    
    const timeSignatureTop = document.getElementById('timeSignatureTop').value;
    const timeSignatureBottom = document.getElementById('timeSignatureBottom').value;
    const tempo = document.getElementById('tempo').value;
    const gain = document.getElementById('gain').value;
    
    gainNode.gain.value = gain;
    startMetronome(timeSignatureTop, timeSignatureBottom, tempo);
    document.getElementById('startStopButton').textContent = 'Stop';
  } else {
    stopMetronome();
    document.getElementById('startStopButton').textContent = 'Start';
  }
});

document.getElementById('gain').addEventListener('input', (event) => {
  if (gainNode !== null) {
    gainNode.gain.value = event.target.value;
  }
});

function startMetronome(timeSignatureTop, timeSignatureBottom, tempo) {
  const interval = (60 / (tempo * timeSignatureBottom / 4)) * 1000; // Convert tempo to milliseconds

  let count = 0;
  intervalId = setInterval(() => {
    click(timeSignatureTop, count);
    count = (count + 1) % timeSignatureTop;
  }, interval);
}

function stopMetronome() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (audioContext !== null) {
    audioContext.close();
    audioContext = null;
  }
}

function click(timeSignatureTop, count) {
  const oscillator = audioContext.createOscillator();
  oscillator.connect(gainNode);
  
  const soundType = document.querySelector('input[name="soundType"]:checked').value;

  // Different sounds for the first beat of the measure and the rest
  if (soundType === 'tone') {
    if (count === 0) {
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    } else {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    }
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } else if (soundType === 'click') {
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const click = audioContext.createBufferSource();
    click.buffer = buffer;
    click.connect(gainNode);
    click.start();
  }
}

// To ensure the script runs only in Google Colab
if (typeof google !== 'undefined' && typeof google.colab !== 'undefined') {
  google.colab.output.clear();
  google.colab.output.append(output);
}
