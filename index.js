const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({
    origin: "https://growwithboss.github.io", 
    methods: ["GET", "POST"]
}));
app.use(express.json());

app.post("/api/ai", async (req, res) => {
    try {
        const { prompt, type, model } = req.body;
        const BYTEZ_KEY = process.env.BYTEZ_API_KEY;

        if (type === 'image') return res.json({ result: prompt });

        let systemMsg = "Reply in high-quality Markdown. ";
        if (type === 'email') systemMsg += "Professionalize this for the office: ";
        if (type === 'code') systemMsg += "Write clean, syntax-highlighted code for: ";
        if (type === 'excel') systemMsg += "Provide the Excel formula and a formatted table for: ";
        if (type === 'chat') systemMsg += "You are BOSSai, a helpful AI. Converse naturally: ";

        // Bytez V2 API Request
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
        
        // Bytez returns the result in data.output
        if (data && data.output) {
            res.json({ result: data.output });
        } else {
            console.error("Bytez Error Details:", data);
            res.json({ result: `BOSSai error: ${data.error || "Model returned no output. Try a different model."}` });
        }
    } catch (error) {
        res.status(500).json({ result: "BOSSai Backend Connection Failed." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`BOSSai Powered by Bytez on port ${PORT}`);
});
