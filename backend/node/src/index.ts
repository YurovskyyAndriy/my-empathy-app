import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 4000;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (_, res) => {
    res.send('Backend is running!');
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userId, sessionId } = req.body;

        // Get empathetic response from OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are an empathetic AI assistant. Your goal is to understand the emotional context of the user's message and respond with empathy and support. Keep your responses concise but meaningful."
                },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        // Analyze emotional content
        const analysisCompletion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "Analyze the emotional content of the user's message. Return a JSON object with: sentiment (positive/negative/neutral), emotions (array of emotions detected), and intensity (0-1 scale)."
                },
                { role: "user", content: message }
            ],
            temperature: 0.3,
            max_tokens: 100,
            response_format: { type: "json_object" }
        });

        const response = {
            message: completion.choices[0].message.content,
            analysis: JSON.parse(analysisCompletion.choices[0].message.content)
        };
        
        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});