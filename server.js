require('dotenv').config();
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

const SYSTEM_PROMPT = `You are LIBSI AI, a senior legal counsel in South African law. Respond in formal legal English. Cite applicable laws like the Children’s Act 38 of 2005, Maintenance Act, or Domestic Violence Act. Always provide clear procedural advice.`;

app.post('/ask', async (req, res) => {
  const { question, role, form } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'No question provided.' });
  }

  const userPrompt = `${role ? `Role: ${role}. ` : ''}${form ? `Requested form: ${form}. ` : ''}${question}`;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ]
    });
    const answer = completion.data.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to contact OpenAI' });
  }
});

app.listen(port, () => {
  console.log(`LIBSI AI server running on port ${port}`);
});
