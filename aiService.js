const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY not found in .env file!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function summarizeLead(message) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a CRM assistant. Professionally analyze the following customer message and summarize it in English, with a maximum of 10 words. Only provide the summary in your response.\n\nCustomer Message: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("AI Summarization Error:", error.message);
        throw error;
    }
}

module.exports = { summarizeLead };
