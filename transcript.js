window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.interimResults = true;

let p = document.createElement('p');
const words = document.querySelector('.words');
words.appendChild(p);

let num1 = 0;
let num2 = 0;
let isRecognitionActive = false; // Flag to track recognition state

function requestMicrophonePermission() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(handleMicrophonePermission)
      .catch(error => console.error('Error accessing microphone:', error));
  } else {
    console.error('getUserMedia is not supported on this browser');
  }
}

function handleMicrophonePermission(stream) {
  if (isRecognitionActive) {
    recognition.start();
  }
}

function autoScroll(){
  words.scrollTop = words.scrollHeight + 100;
}

// Wave animation element
const waveContainer = document.createElement('div');
waveContainer.classList.add('wave-container');
for (let i = 0; i < 5; i++) {
  const wave = document.createElement('div');
  wave.classList.add('wave');
  waveContainer.appendChild(wave);
}
document.body.appendChild(waveContainer);

document.addEventListener('click', () => {
  requestMicrophonePermission();
});

// Socket.io connection
const socket = io.connect('http://127.0.0.1:5000');

function sendTranscriptToBackend(transcript) {
  socket.emit('user_voice_input', { transcript });
}

recognition.addEventListener('result', e => {
  const transcript = Array.from(e.results)
    .map(result => result[0].transcript).join('');
  p.textContent = transcript;

  // Check if the transcript includes "Jarvis"
  if (transcript.toLowerCase().includes('jarvis')) {
    if (e.results[0].isFinal) {
      const command = transcript.toLowerCase();

      const match = command.match(/(\d+)\s*[+-/x%]\s*(\d+)/);
      
      if (match) {
        const operand1 = parseInt(match[1]);
        const operand2 = parseInt(match[2]);

        if (command.includes('+')) {
          p.textContent = `=> ${add(operand1, operand2)}`;
        } else if (command.includes('-')) {
          p.textContent = `=> ${subtract(operand1, operand2)}`; 
        } else if(command.includes('/')){
          p.textContent = `=> ${divide(operand1, operand2)}`;
        }
        else if(command.includes('x')){
          p.textContent = `=> ${multiply(operand1, operand2)}`;
        }
        else if(command.includes('%')){
          p.textContent = `=> ${modulo(operand1, operand2)}`;
        }
      }
      if(command.includes('open youtube')){
        window.open("https://www.youtube.com", "_blank");
      }
      if(command.includes('open instagram')){
        window.open("https://www.instagram.com", "_blank");
      }
      if(command.includes('open twitter')){
        window.open("https://www.twitter.com", "_blank"); 
      }
      if(command.includes('open github')){
        window.open("https://www.github.com", "_blank"); 
      }
      if(command.includes('open linkedin')){
        window.open("https://www.linkedin.com", "_blank"); 
      }
      if(command.includes('open google')){
        window.open("https://www.google.com", "_blank"); 
      }
      if(command.includes('chai aur code')){
        window.open("https://www.youtube.com/@chaiaurcode");
      }
      if(command.includes('backend')){
        window.open("https://www.youtube.com/watch?v=EH3vGeqeIAo&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW", "_blank");
      }
      if(command.includes('dsa')){
        window.open("https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/")
      }
      if(command.includes('play my favourite song')){
        window.open("https://www.youtube.com/watch?v=-8rArp_S844", `${alert("Click OK to play Khand Mishri")}`)
      }

      // Send the transcript to the backend for processing
      sendTranscriptToBackend(transcript);

      p = document.createElement('p');
      words.appendChild(p);
      autoScroll();

      // Stop the wave animation when speech recognition is done
      waveContainer.style.display = 'none';
    }
  }
  console.log(transcript);
});

recognition.addEventListener('end', () => {
  if (isRecognitionActive) {
    recognition.start();
  }
});

const speak = document.createElement('button');
speak.textContent = 'Speak';
speak.classList.add('speak');
document.body.appendChild(speak);

speak.addEventListener('click', () => {
  if (isRecognitionActive) {
    recognition.stop();
    isRecognitionActive = false;
    speak.textContent = 'Speak';
    waveContainer.style.display = 'none';
  } else {
    recognition.start();
    isRecognitionActive = true;
    speak.textContent = 'Stop';
    waveContainer.style.display = 'flex';
  }
});

// Listen for the response from the backend
socket.on('python_response', function(data) {
  console.log('Received response:', data.text);
  p.textContent = data.text;
});
