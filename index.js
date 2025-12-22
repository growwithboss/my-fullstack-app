const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Office AI Backend is running!");
});

app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.AIzaSyA3C50hjiASoWnhi0G-8Q1iozqq5Cr4Mco;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Professionalize this for an office: " + text }] }]
            })
        });

        const data = await response.json();
        const refined = data.candidates[0].content.parts[0].text;
        res.json({ refinedText: refined });
    } catch (error) {
        res.status(500).json({ error: "AI Processing Failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
