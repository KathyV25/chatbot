const sendBtn = document.getElementById('send-btn');
const speakBtn = document.getElementById('speak-btn');
const exportBtn = document.getElementById('export-btn');
const inputEl = document.getElementById('user-input');
const roleEl = document.getElementById('role');
const formEl = document.getElementById('legal-form');

sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

speakBtn.addEventListener('click', startSpeech);
exportBtn.addEventListener('click', exportChat);

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  appendMessage('user', text);
  inputEl.value = '';

  const payload = {
    question: text,
    role: roleEl.value,
    form: formEl.value
  };

  const response = await fetch('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  appendMessage('assistant', data.answer || 'Error');
}

function appendMessage(role, content) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.textContent = `${role === 'user' ? 'You' : 'LIBSI AI'}: ${content}`;
  document.getElementById('chat-window').appendChild(div);
  document.getElementById('chat-window').scrollTop = document.getElementById('chat-window').scrollHeight;
  if (role === 'assistant') {
    const utter = new SpeechSynthesisUtterance(content);
    speechSynthesis.speak(utter);
  }
}

function startSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech recognition not supported');
    return;
  }
  const rec = new SpeechRecognition();
  rec.lang = 'en-US';
  rec.onresult = (e) => {
    inputEl.value = e.results[0][0].transcript;
    sendMessage();
  };
  rec.start();
}

function exportChat() {
  const element = document.getElementById('chat-window');
  html2pdf().from(element).save('libsi-chat.pdf');
}
