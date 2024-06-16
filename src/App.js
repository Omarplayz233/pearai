import React, { useState } from 'react';
import { Container, TextField, Button, CircularProgress, Typography, Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const userMessage = { role: 'user', text: input };
    setMessages([userMessage, ...messages]);
    setInput('');
    setLoading(true);

    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: input })
    });

    const result = await response.json();
    const aiMessage = { role: 'model', text: result.response };
    setMessages([aiMessage, userMessage, ...messages]);
    setLoading(false);
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f0f4c3"
    >
      <Container maxWidth="sm" style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <Typography variant="h4" gutterBottom>PearAI</Typography>
        <Box id="chat-response" style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
          {loading && (
            <Box className="thinking" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
              <CircularProgress />
            </Box>
          )}
          {messages.map((msg, index) => (
            <Typography key={index} variant="body1" className="message" style={{ backgroundColor: '#f5f5f5', borderRadius: '5px', padding: '10px', margin: '5px 0', textAlign: 'left', transition: 'transform 0.5s', transform: 'translateY(-10px)' }}>
              {msg.role === 'user' ? `You: ${msg.text}` : (
                <>
                  <Typography variant="body1" component="span" style={{ fontWeight: 'bold' }}>PearAI:</Typography>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </>
              )}
            </Typography>
          ))}
        </Box>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Type your message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            style={{ marginRight: '10px' }}
          />
          <Button variant="contained" color="primary" type="submit">Send</Button>
        </form>
      </Container>
    </Box>
  );
};

export default App;
