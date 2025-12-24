const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        // Custom system instructions based on the button clicked
        let systemInstruction = "";
        if (type === 'email') systemInstruction = "You are a professional corporate assistant. Rewrite this into a polished, executive-level office email: ";
        if (type === 'code') systemInstruction = "You are a senior software engineer. Provide clean, efficient code with brief comments for: ";
        if (type === 'excel') systemInstruction = "You are an Excel expert. Provide only the formula and a 1-sentence explanation for: ";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemInstruction + prompt }] }],
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
            res.json({ result: data.candidates[0].content.parts[0].text });
        } else {
            res.json({ result: "AI error: " + (data.error?.message || "Safety Block") });
        }
    } catch (error) {
        res.status(500).json({ result: "Server error occurred." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Canvas Backend Live"));
