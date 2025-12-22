// Add this to your existing index.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // You may need to install node-fetch

app.post("/api/refine", async (req, res) => {
    const { text } = req.body;
    const API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // Use environment variables later!

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${AIzaSyA3C50hjiASoWnhi0G-8Q1iozqq5Cr4Mco}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: "Refine this text for a professional office setting: " + text }] }]
        })
    });

    const data = await response.json();
    res.json({ refinedText: data.candidates[0].content.parts[0].text });
});
