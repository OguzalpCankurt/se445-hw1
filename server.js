require('dotenv').config();
const express = require('express');

const { summarizeLead } = require('./aiService');
const { appendRow } = require('./sheetsService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/lead', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, and message are required.'
      });
    }

    console.log(`--- Processing New Lead from ${name} ---`);

    const summary = await summarizeLead(message);
    console.log(`AI Summary generated: ${summary}`);

    await appendRow({ name, email, message, summary });
    console.log(`Lead successfully saved to Google Sheets.`);

    res.status(200).json({
      success: true,
      message: 'Lead processed and saved successfully.',
      data: {
        name,
        email,
        summary
      }
    });

  } catch (error) {
    console.error('Error processing lead:', error.message);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your request.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
