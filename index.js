const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/status", async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.json({ status: "❌ Error", message: "Key missing in Render settings." });
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash?key=${key}`);
        if (response.ok) {
            res.json({ status: "✅ Connected", message: "AI is ready to work!" });
        } else {
            const err = await response.json();
            res.json({ status: "⚠️ Issue", message: err.error.message });
        }
    } catch (err) {
        res.json({ status: "❌ Offline", message: "Cannot reach Google servers." });
    }
});

app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Rewrite this message to be professional for an office: " + text }] }],
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            res.json({ refinedText: data.candidates[0].content.parts[0].text });
        } else {
            res.json({ refinedText: "AI could not generate a response. Try different words." });
        }
    } catch (error) {
        res.status(500).json({ error: "Server Internal Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("System Online"));
