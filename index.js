const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (type === 'image') return res.json({ result: prompt }); 

        let instruction = "";
        if (type === 'email') instruction = "You are BOSSai. Professionalize this email: ";
        if (type === 'code') instruction = "You are BOSSai. Write clean code for: ";
        if (type === 'excel') instruction = "You are BOSSai. Give Excel formula for: ";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: instruction + prompt }] }] })
        });

        const data = await response.json();
        res.json({ result: data.candidates?.[0].content.parts[0].text || "BOSSai: No response." });
    } catch (error) {
        res.status(500).json({ result: "BOSSai Server Error." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("BOSSai Live"));
