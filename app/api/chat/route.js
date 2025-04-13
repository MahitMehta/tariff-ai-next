import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const { question, context } = await req.json();

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

    const userMessage = `
Context:
${context || ''}

User Question:
${question}

You are a financial analyst AI, you have to realise the international scene and understand politics and things said in politics and other factors. If you are provided a context, based your reasoning on the context. Do not use formating or markdown. Provide 3-6 sentences max.
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