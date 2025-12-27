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

        // Bytez Model API URL format
        const response = await fetch(`https://api.bytez.com/models/v2/${model}`, {
            method: "POST",
            headers: {
                "Authorization": BYTEZ_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        
        // Extracting data.output as per Bytez documentation
        if (data && data.output) {
            res.json({ result: data.output });
        } else {
            // Log the error for debugging
            res.json({ result: `BOSSai error: ${data.error || "Model response empty. Try another model."}` });
        }
    } catch (error) {
        res.status(500).json({ result: "Backend connection error." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`BOSSai Powered by Bytez on port ${PORT}`);
});
