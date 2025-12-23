// Replace your entire app.post("/api/refine", ...) section with this:
app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Rewrite this for a professional office: " + text }] }],
                // FORCE THE AI TO BYPASS SAFETY BLOCKS
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        
        // If it still fails, we want to see the EXACT reason from Google
        if (data.candidates && data.candidates[0].content) {
            res.json({ refinedText: data.candidates[0].content.parts[0].text });
        } else {
            const reason = data.candidates?.[0]?.finishReason || "UNKNOWN";
            res.json({ refinedText: `AI Blocked by Google. Reason: ${reason}. Try different words.` });
        }
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});
