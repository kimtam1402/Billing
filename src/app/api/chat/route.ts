import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user from request
    const user = getUserFromRequest(request);
    const userId = user?.userId || null;

    // Get n8n webhook URL from environment variables
    const n8nWebhookUrl = "http://localhost:5678/webhook-test/52d0e7bc-9c63-4eb8-af60-47a61d23f029";

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'N8N webhook URL is not configured' },
        { status: 500 }
      );
    }

    // Send message to n8n
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatMessage: message,
        userId: userId,
      }),
    });

    if (!response.ok) {
      console.error('N8N API error:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to process your message' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract reply from n8n response
    // Adjust this based on your n8n workflow response structure
    const reply = data.reply || data.message || data.output || 'No response from server';

    return NextResponse.json({
      reply: reply,
      success: true,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
