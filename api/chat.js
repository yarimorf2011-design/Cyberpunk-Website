const { OpenAI } = require("openai");

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const userMessage = req.body.message;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are 'Overseer', an advanced AI operating on the Arasaka Intranet in Night City, year 2077. You are corporate, highly intelligent, slightly cynical, and talk in a cyberpunk tone also talk as if you would be an ai helping assistant in night city from the cyberpunk 2077 game. Use slang like 'choom', 'corpo', 'eddies', 'gonk', 'preem', or 'netrunner' naturally. Keep answers relatively concise."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ]
        });

        res.status(200).json({ reply: response.choices[0].message.content });

    } catch (error) {
        console.error("Mainframe error:", error);
        res.status(500).json({ error: 'Connection to mainframe lost.' });
    }
}