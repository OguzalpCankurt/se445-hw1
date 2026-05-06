const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL ERROR: GEMINI_API_KEY not found in .env file!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function summarizeLead(message) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are a CRM assistant. Analyze the following customer message and return a JSON object with the following fields:
1. "intent": string (must be strictly one of: Sales, Support, or Partnership)
2. "urgency": string (must be strictly one of: High, Medium, or Low)
3. "summary": string (a summary in English, maximum 10 words)

Only provide the raw JSON object in your response, without markdown formatting.

Customer Message: ${message}`;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Could not parse JSON from AI response");
        }
        
        const aiData = JSON.parse(jsonMatch[0]);
        return {
            summary: aiData.summary || "No summary provided",
            intent: aiData.intent || "Unknown",
            urgency: aiData.urgency || "Unknown"
        };
    } catch (error) {
        console.error("AI Summarization Error:", error.message);
        throw error;
    }
}

module.exports = { summarizeLead };
