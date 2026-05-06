const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './service_account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendRow({ name, email, message, summary, intent, urgency, validation_status }) {
  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('Missing GOOGLE_SHEET_ID in environment variables.');
    }

    const range = 'Sayfa1!A:H';

    const request = {
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [
          [name, email, message, summary, validation_status, intent, urgency, new Date().toISOString()]
        ],
      },
    };

    const response = await sheets.spreadsheets.values.append(request);
    console.log(`Successfully appended row to Google Sheets.`);
    return response.data;
  } catch (error) {
    console.error('Error in appendRow:', error.message);
    throw error;
  }
}

module.exports = {
  appendRow,
};
