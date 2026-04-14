require('dotenv').config();
const express = require('express');

const { summarizeLead } = require('./aiService');
const { appendRow } = require('./sheetsService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/summarize', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: 'Missing required field: message' });
    }
    
    console.log(`--- Summarizing Lead Message ---`);
    const summary = await summarizeLead(message);
    console.log(`AI Summary generated: ${summary}`);
    
    res.status(200).json({ success: true, summary });
  } catch (error) {
    console.error('Error summarizing lead:', error.message);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.post('/api/saveSheet', async (req, res) => {
  try {
    const { name, email, message, summary } = req.body;
    if (!name || !email || !message || !summary) {
      return res.status(400).json({ success: false, error: 'Missing fields' });
    }

    console.log(`--- Saving Lead to Sheets ---`);
    await appendRow({ name, email, message, summary });
    console.log(`Lead successfully saved to Google Sheets.`);

    res.status(200).json({ success: true, message: 'Saved successfully' });
  } catch (error) {
    console.error('Error saving to sheet:', error.message);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
