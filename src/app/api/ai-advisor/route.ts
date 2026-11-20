import { NextResponse } from 'next/server';
import { BizNovaAIAdvisorService } from '@/lib/aiAdvisor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid query string is required' }, { status: 400 });
    }

    // Check if an external LLM key is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // Use our high-precision database business advisor service
    const advisorMessage = await BizNovaAIAdvisorService.queryAdvisor(query);

    return NextResponse.json({
      success: true,
      hasLiveLLMKey: !!apiKey,
      provider: apiKey ? 'Configured LLM Provider' : 'BizNova Intelligent Store Engine (Demo Mode)',
      data: advisorMessage,
    });
  } catch (error: any) {
    console.error('AI Advisor API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI Advisor query', details: error?.message },
      { status: 500 }
    );
  }
}
