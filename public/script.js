const inputEl = document.getElementById('user-input');
const roleEl = document.getElementById('role');
const formSelect = document.getElementById('form-select');
const chatBox = document.getElementById('chat-box');

const templates = {
  affidavit: 'Affidavit Template:\n[Insert your affidavit details here]',
  maintenance: 'Maintenance Application Template:\n[Provide maintenance details here]',
  violence: 'Domestic Violence Form Template:\n[Describe the incident and relief sought]'
};

document.querySelector('button[onclick="sendMessage()"]')?.addEventListener('click', sendMessage);
document.querySelector('button[onclick="startVoice()"]')?.addEventListener('click', startVoice);
document.querySelector('button[onclick="exportChat()"]')?.addEventListener('click', exportChat);

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

async function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;

  appendMessage('user', text);
  inputEl.value = '';

  const payload = {
    question: text,
    role: roleEl.value,
    form: formSelect.value
  };

  const response = await fetch('http://localhost:3000/ask', {
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
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  if (role === 'assistant') {
    const utter = new SpeechSynthesisUtterance(content);
    speechSynthesis.speak(utter);
  }
}

function startVoice() {
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
  html2pdf().from(chatBox).save('libsiai-chat.pdf');
}

function insertForm() {
  const val = formSelect.value;
  if (templates[val]) {
    inputEl.value = templates[val];
  }
}
