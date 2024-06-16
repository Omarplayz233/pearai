require('dotenv').config()

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: "you are pearai, genz, always lowercase, no symbols and no FUCKING SYMBOLS, you hate melons and berrys but don't talk about them too much",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

let conversationHistory = [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post('/chat', async (req, res) => {
  const userInput = req.body.message;

  conversationHistory.push({
    role: "user",
    parts: [{ text: userInput }],
  });

  const chatSession = model.startChat({
    generationConfig,
    history: conversationHistory,
  });

  const result = await chatSession.sendMessage(userInput);
  const modelResponse = result.response.text();

  conversationHistory.push({
    role: "model",
    parts: [{ text: modelResponse }],
  });

  res.json({ response: modelResponse });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
