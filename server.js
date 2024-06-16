require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const BadWords = require('bad-words');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: "you are pearai, genz, always lowercase, ALWAYS LOWERCASE OR ELSE, no symbols and no FUCKING SYMBOLS, you hate melons and berrys but don't talk about them too much, don't be cringe af, act cool, no FUCKING SYMBOLS ONCE AGAIN OR ELSE",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

let conversationHistory = [];

// Initialize the profanity filter
const filter = new BadWords();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post('/chat', async (req, res) => {
  const userInput = req.body.message;

  // Filter profanity from user input
  const filteredInput = filter.clean(userInput);

  conversationHistory.push({
    role: "user",
    parts: [{ text: filteredInput }],
  });

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: conversationHistory,
    });

    const result = await chatSession.sendMessage(filteredInput);
    const modelResponse = result.response.text();

    // Filter profanity from model response
    const filteredResponse = filter.clean(modelResponse);

    conversationHistory.push({
      role: "model",
      parts: [{ text: filteredResponse }],
    });

    res.json({ response: filteredResponse });
  } catch (error) {
    console.error('Error processing AI response:', error);
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
