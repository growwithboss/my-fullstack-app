const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type, model } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Image generation handled separately via Pollinations (Free)
        if (type === 'image') return res.json({ result: prompt });

        let systemInstruction = "";
        if (type === 'email') systemInstruction = "You are BOSSai. Professionalize this for an office: ";
        if (type === 'code') systemInstruction = "You are BOSSai. Write efficient code for: ";
        if (type === 'excel') systemInstruction = "You are BOSSai. Provide the Excel formula for: ";

        // Uses the dynamic model ID passed from the frontend
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemInstruction + prompt }] }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            res.json({ result: data.candidates[0].content.parts[0].text });
        } else {
            res.json({ result: `BOSSai error: ${data.error?.message || "Model not responding"}` });
        }
    } catch (error) {
        res.status(500).json({ result: "BOSSai Server Error." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("BOSSai Multi-Model Hub Live"));


const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type, model } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (type === 'image') return res.json({ result: prompt });

        let systemInstruction = "Reply using clean Markdown formatting. Use bold, tables, and code blocks where appropriate. ";
        if (type === 'email') systemInstruction += "You are BOSSai. Professionalize this for the office: ";
        if (type === 'code') systemInstruction += "You are BOSSai. Provide code in a syntax-highlighted block with comments: ";
        if (type === 'excel') systemInstruction += "You are BOSSai. Provide an Excel formula or a formatted table: ";
        if (type === 'chat') systemInstruction += "You are BOSSai, a helpful AI assistant. Engage in a natural conversation: ";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemInstruction + prompt }] }] })
        });

        const data = await response.json();
        res.json({ result: data.candidates?.[0].content.parts[0].text || "No response." });
    } catch (error) {
        res.status(500).json({ result: "BOSSai Server Error." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("BOSSai Pro Live"));
