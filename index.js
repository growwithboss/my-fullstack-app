const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type, model } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Image requests don't need Gemini; they go to Pollinations
        if (type === 'image') return res.json({ result: prompt });

        let systemInstruction = "";
        if (type === 'email') systemInstruction = "You are BOSSai. Professionalize this email: ";
        if (type === 'code') systemInstruction = "You are BOSSai. Write clean code for: ";
        if (type === 'excel') systemInstruction = "You are BOSSai. Give Excel formula for: ";

        // Dynamic model selection
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
            res.json({ result: "BOSSai error: " + (data.error?.message || "Model Unavailable") });
        }
    } catch (error) {
        res.status(500).json({ result: "BOSSai Server Error." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("BOSSai Multi-Model Hub Live"));
