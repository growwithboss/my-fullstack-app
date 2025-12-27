const express = require("express");
const cors = require("cors");
const app = express();

// 1. Security & CORS: Update the origin to your exact GitHub Pages URL
app.use(cors({
    origin: "https://growwithboss.github.io", 
    methods: ["GET", "POST"]
}));
app.use(express.json());

// 2. Main BOSSai Logic
app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type, model } = req.body;
        const BYTEZ_KEY = process.env.BYTEZ_API_KEY;

        if (type === 'image') return res.json({ result: prompt });

        let systemMsg = "Reply in high-quality Markdown. ";
        if (type === 'email') systemMsg += "Professionalize this for an office environment: ";
        if (type === 'code') systemMsg += "Write clean, syntax-highlighted code for: ";
        if (type === 'excel') systemMsg += "Provide the Excel formula and a formatted table for: ";
        if (type === 'chat') systemMsg += "You are BOSSai, a helpful AI. Converse naturally: ";

        // Bytez V2 API Call
        const response = await fetch(`https://api.bytez.com/models/v2/${model}`, {
            method: "POST",
            headers: {
                "Authorization": BYTEZ_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemMsg },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        res.json({ result: data.output || "BOSSai error: Model did not return text." });
    } catch (error) {
        res.status(500).json({ result: "BOSSai Backend Connection Failed." });
    }
});

// 3. Heartbeat & Port Binding
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`BOSSai Online on port ${PORT}`);
});

// 4. STAY AWAKE: Self-ping every 14 minutes
setInterval(() => {
    fetch(`https://my-fullstack-app-gvce.onrender.com/api/status`).catch(() => {});
}, 840000);
