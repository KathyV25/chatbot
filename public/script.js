async function sendMessage() {
  const inputField = document.getElementById('user-input');
  const text = inputField.value.trim();
  if (!text) return;

  const role = document.getElementById('role').value;
  const chatBox = document.getElementById('chat-box');
  chatBox.innerHTML += `<p><strong>You (${role}):</strong> ${text}</p>`;

  try {
    const res = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `[${role}] ${text}` })
    });
    const data = await res.json();
    chatBox.innerHTML += `<p><strong>LexiAI:</strong> ${data.response}</p>`;
    inputField.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
    speak(data.response);
  } catch (err) {
    chatBox.innerHTML += `<p><strong>LexiAI:</strong> Error contacting server.</p>`;
  }
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-ZA';
  recognition.start();
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('user-input').value = transcript;
  };
  recognition.onerror = () => {
    alert('Voice input failed.');
  };
}

function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-ZA';
  synth.speak(utter);
}

function exportChat() {
  const chat = document.getElementById('chat-box');
  html2pdf().from(chat).save('LexiAI_Chat.pdf');
}
