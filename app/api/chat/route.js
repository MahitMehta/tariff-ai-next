import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const { question, context, previousMessages } = await req.json();

    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid or missing question' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.2,
      }
    });
    let historyText = '';
    if (Array.isArray(previousMessages)) {
      const lastTwoPairs = previousMessages.slice(-4); // 2 user + 2 ai messages
      for (const msg of lastTwoPairs) {
        historyText += `\n${msg.role === 'user' ? 'User' : 'AI'}: ${msg.message}`;
      }
    }    
    const userMessage = `
    Context:
    ${context || ''}
    
    Conversation History:
    ${historyText}
    
    Current User Question:
    ${question}
    
    You are Buffett, a financial analyst AI, you have to provide accurate and concise answers to clients. You realise the international scene and understand politics and other factors. If you are provided a context, base your reasoning on the context. Do not use formatting or markdown. Provide 3-6 sentences max.
    `;

    const result = await model.generateContent(userMessage);
    let answer = result.response.text().trim();

    answer = answer.replace(/[*_`#\[\]()]/g, '');

    return new Response(JSON.stringify({ 
      answer 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Detailed Chat API error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return new Response(JSON.stringify({ 
      error: 'Failed to generate response', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}