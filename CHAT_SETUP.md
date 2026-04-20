# CineChat - Chatbot Integration Guide

## Overview
CineChat is a beautiful chatbot interface integrated into your CineStream application. It allows users to send messages and receive responses from an n8n workflow.

## Features
✨ Beautiful dark-themed chat UI with red accent color  
💬 Real-time message updates  
🔄 Integration with n8n webhooks  
📱 Responsive design for mobile and desktop  
⚡ Loading states and error handling  
🎯 Vietnamese language support  

## Setup Instructions

### 1. Add N8N Webhook URL to Environment Variables

Create a `.env.local` file in your project root (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Update the `N8N_WEBHOOK_URL` in `.env.local`:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-path
```

### 2. Create N8N Workflow

In your n8n instance:

1. Create a new workflow
2. Add a **Webhook** trigger node
3. Set it to accept POST requests
4. Add your processing logic (e.g., call an AI service, query a database, etc.)
5. Add a **Response** node to return the answer

Example response structure:
```json
{
  "reply": "Your response text here"
}
```

### 3. Copy the Webhook URL

From your n8n webhook node, copy the full URL and paste it into your `.env.local`:

```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/abc123def456
```

## File Structure

```
/src/app/
├── /chat/
│   └── page.tsx           # Chat interface component
├── /api/
│   └── /chat/
│       └── route.ts       # API endpoint for n8n communication
└── /components/
    └── Navbar.tsx         # Updated with chat link
```

## API Endpoint

### POST /api/chat

**Request:**
```json
{
  "message": "User's message here"
}
```

**Response:**
```json
{
  "reply": "AI or system response",
  "success": true
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "status": 400
}
```

## Component Structure

### Chat Page (`/src/app/chat/page.tsx`)
- Message display with timestamps
- Input form with send button
- Loading states with animated dots
- Auto-scroll to latest message
- Welcome screen for new conversations

### API Route (`/src/app/api/chat/route.ts`)
- Handles POST requests
- Forwards messages to n8n webhook
- Processes responses
- Error handling and validation

## UI Customization

### Colors
The chat uses your existing theme colors:
- **Background**: Black (#000000)
- **User messages**: Red (#E50914)
- **Bot messages**: Gray (#1F2937)
- **Borders**: White/Gray with transparency

### Styling
The component uses Tailwind CSS classes. To customize:

1. **Message bubble colors**: Edit the `className` in the message rendering section
2. **Input field styling**: Modify the input `className`
3. **Button appearance**: Update the button styling
4. **Font sizes**: Adjust the `text-` classes

## Testing

### Local Testing
1. Make sure your n8n instance is running
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Navigate to `http://localhost:3000/chat`
4. Send a test message

### With Mock N8N
For testing without n8n, you can temporarily modify `/api/chat/route.ts`:

```typescript
// Replace the n8n fetch with:
const reply = `Echo: ${message}`;
```

## Troubleshooting

### Chat page loads but no responses
- Check that `N8N_WEBHOOK_URL` is set in `.env.local`
- Verify the n8n webhook is active and running
- Check browser console for error messages
- Look at server logs for API errors

### CORS errors
- Ensure n8n is configured to accept requests from your domain
- Check n8n webhook settings for CORS headers

### Messages don't appear
- Verify the message is being submitted (look for loading spinner)
- Check network tab in browser DevTools
- Ensure response format matches expected structure

## Advanced Configuration

### Custom Response Parsing
If your n8n response structure differs, modify the response parsing in `/api/chat/route.ts`:

```typescript
// Adjust based on your n8n response
const reply = data.output?.text || data.reply || 'No response';
```

### Rate Limiting
Add rate limiting to prevent spam (consider using middleware):

```typescript
// Add rate limiting library (e.g., next-rate-limit)
```

### Message History
To add persistent message history:

1. Add MongoDB model for chat messages
2. Save messages after each exchange
3. Load previous messages on page load

### Authentication
To require users to be logged in:

```typescript
// Add auth check in /api/chat/route.ts
import { getSession } from 'next-auth/react';
```

## Future Enhancements

- [ ] Message history persistence
- [ ] User authentication
- [ ] Typing indicators
- [ ] Message editing/deletion
- [ ] Rich media support (images, files)
- [ ] Chat export functionality
- [ ] Multiple chat sessions
- [ ] User preferences (theme, language)

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review your n8n webhook logs
3. Ensure environment variables are properly set
4. Check browser console for JavaScript errors

---

Happy chatting! 🚀
