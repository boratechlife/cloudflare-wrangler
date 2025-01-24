import {widgetHTML} from './widget.js';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Serve the HTML widget
    if (url.pathname === '/') {
      return new Response(widgetHTML, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Handle form submission
    if (url.pathname === '/submit' && request.method === 'POST') {
      const formData = await request.formData();
      const data = Object.fromEntries(formData.entries());

      // Log the form data
      console.log('Form Data:', data);

      // Return a success response
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle unknown routes
    return new Response('Not Found', { status: 404 });
  },
};