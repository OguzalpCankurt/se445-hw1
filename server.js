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
    const { summary, intent, urgency } = await summarizeLead(message);
    console.log(`AI Summary generated: ${summary}, Intent: ${intent}, Urgency: ${urgency}`);
    
    res.status(200).json({ success: true, summary, intent, urgency });
  } catch (error) {
    console.error('Error summarizing lead:', error.message);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.post('/api/saveSheet', async (req, res) => {
  try {
    const { name, email, message, summary, intent, urgency } = req.body;
    
    let validation_status = 'Valid';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !message || !emailRegex.test(email)) {
      validation_status = 'Invalid';
    }

    console.log(`--- Saving Lead to Sheets ---`);
    await appendRow({ name, email, message, summary, intent, urgency, validation_status });
    console.log(`Lead successfully saved to Google Sheets.`);

    res.status(200).json({ success: true, message: 'Saved successfully', validation_status });
  } catch (error) {
    console.error('Error saving to sheet:', error.message);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.post('/webhook', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    let validation_status = 'Valid';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name || !email || !message || !emailRegex.test(email)) {
      validation_status = 'Invalid';
    }

    console.log(`--- Processing Webhook POST ---`);
    const { summary, intent, urgency } = await summarizeLead(message || "No message provided");
    console.log(`AI Summary generated: ${summary}, Intent: ${intent}, Urgency: ${urgency}`);
    
    await appendRow({ name, email, message, summary, intent, urgency, validation_status });
    console.log(`Webhook process success. Lead successfully saved to Google Sheets.`);

    res.status(200).json({ success: true, message: 'Processed webhook successfully', validation_status });
  } catch (error) {
    console.error('Error in webhook:', error.message);
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
