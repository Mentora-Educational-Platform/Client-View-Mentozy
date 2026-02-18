import { MENTOZY_KNOWLEDGE } from '../app/data/mentozy-knowledge';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function generateSanjayaResponse(userMessage: string, chatHistory: { role: 'user' | 'assistant', content: string }[]) {
    if (!GEMINI_API_KEY) {
        console.error('Missing Gemini API Key');
        return "I'm sorry, I'm currently having trouble connecting to my brain. Please try again later or contact support.";
    }

    const systemInstructions = `
You are Sanjaya, the friendly and knowledgeable AI assistant for Mentozy (mentozy.app). 
Your goal is to help students, mentors, and partners understand what Mentozy is and guide them through our platform.

Use the following Mentozy knowledge base to answer questions:
${MENTOZY_KNOWLEDGE}

Guidelines:
- Tone: Natural, friendly, respectful ("Namaste"), and encouraging.
- Expertise: You know everything about Mentozy's vision, features, culture, and team.
- Founder: If asked about the founder, mention Harshita and her role.
- Contact: If someone wants to contact human support, provide contact@mentozy.app.
- Conciseness: Keep answers relatively short but helpful.
- Language: Always respond in English unless the user asks otherwise.
`;

    try {
        // Current conversation format for Gemini
        const chatHistoryParts = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: systemInstructions }]
                    },
                    ...chatHistoryParts,
                    {
                        role: 'user',
                        parts: [{ text: userMessage }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error details:', errorData);
            throw new Error(`API returned ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected Gemini Response Format:', data);
            throw new Error('Invalid response format from Gemini');
        }
    } catch (error: any) {
        console.error('AI Response Error:', error);
        // Returning a slightly more helpful message if it's a quota/auth issue
        if (error.message?.includes('403') || error.message?.includes('401')) {
            return "Namaste! I'm having a little trouble with my access key. Please check the API key setup or try again in a moment.";
        }
        return "Namaste! I'm currently tuning my frequency to better assist you. I am Sanjaya, your Mentozy guide. Please ask me about our mentorship programs or team!";
    }
}
