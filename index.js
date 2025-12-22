app.post("/api/refine", async (req, res) => {
    try {
        const { text } = req.body;
        const API_KEY = process.env.AIzaSyA3C50hjiASoWnhi0G-8Q1iozqq5Cr4Mco;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Rewrite this message to be professional for an office: " + text }] }],
                // ADD THIS: Disable safety filters to prevent empty responses
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            })
        });

        const data = await response.json();
        
        // Log the full data to Render logs so you can see if it was a safety block
        console.log("AI Response:", JSON.stringify(data));

        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            const refined = data.candidates[0].content.parts[0].text;
            res.json({ refinedText: refined });
        } else {
            // If empty, check the reason (usually SAFETY or RECITATION)
            const reason = data.candidates?.[0]?.finishReason || "UNKNOWN";
            res.json({ refinedText: `AI blocked the response. Reason: ${reason}` });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "AI Processing Failed" });
    }
});
