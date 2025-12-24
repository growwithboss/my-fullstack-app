const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // If it's an image request, we just return the prompt for Pollinations
        if (type === 'image') {
            return res.json({ result: prompt }); 
        }

        let systemInstruction = "";
        if (type === 'email') systemInstruction = "You are BOSSai, a professional corporate assistant. Rewrite this into a polished email: ";
        if (type === 'code') systemInstruction = "You are BOSSai, a software engineer. Provide clean code for: ";
        if (type === 'excel') systemInstruction = "You are BOSSai, an Excel expert. Provide the formula for: ";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
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
            res.json({ result: "BOSSai error: AI Response empty." });
        }
    } catch (error) {
        res.status(500).json({ result: "BOSSai internal server error." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("BOSSai Multi-Modal Live"));
