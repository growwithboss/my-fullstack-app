const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// 1. New Status Check Route
app.get("/api/status", async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        return res.json({ status: "❌ Error", message: "API Key is missing in Render Environment Variables." });
    }
    
    try {
        // Simple request to see if the key is valid
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=${key}`);
        if (response.ok) {
            res.json({ status: "✅ Connected", message: "Backend is successfully talking to Google AI." });
        } else {
            const errData = await response.json();
            res.json({ status: "⚠️ Key Issue", message: errData.error.message });
        }
    } catch (err) {
        res.json({ status: "❌ Offline", message: "Could not reach Google servers." });
    }
});

// 2. Your existing Refine Route
app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Professionalize: " + text }] }] })
        });
        const data = await response.json();
        res.json({ refinedText: data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(500).json({ error: "AI logic failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Live"));
