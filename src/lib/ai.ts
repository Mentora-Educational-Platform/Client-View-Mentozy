import { BOT_RESPONSES } from './bot-data';

export async function generateSanjayaResponse(userMessage: string, chatHistory: { role: 'user' | 'assistant', content: string }[]) {
    // Simulate a small delay for "thinking"
    await new Promise(resolve => setTimeout(resolve, 600));

    const normalizedMessage = userMessage.toLowerCase().trim();

    // 1. Direct Keyword Matching
    // Find the response where the user message contains one of the keywords
    const matchedResponse = BOT_RESPONSES.find(item =>
        item.keywords.some(keyword => normalizedMessage.includes(keyword.toLowerCase()))
    );

    if (matchedResponse) {
        return matchedResponse.answer;
    }

    // 2. Specific Fallbacks for common conversational fillers
    if (normalizedMessage.length < 3) {
        return "I didn't quite catch that. Could you please say a bit more?";
    }

    // 3. Generic Fallback
    return "I am Mentozy's assistant. I can help you with platform questions, joining as a mentor, or student queries. Please ask me specifically about those topics, or email hello@mentozy.app for support.";
}
