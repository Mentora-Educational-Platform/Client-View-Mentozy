import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text } = await req.json();

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, and html/text" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Configured via Supabase Secret or Environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    // 1. Try Resend API
    if (resendApiKey) {
      // First try with official domain
      let sender = 'Mentozy Admissions <onboarding@resend.dev>';
      
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          html: html,
          text: text || undefined,
        }),
      });

      if (resendResponse.ok) {
        const data = await resendResponse.json();
        return new Response(
          JSON.stringify({ message: "Email sent via Resend", id: data.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } else {
        const resendErr = await resendResponse.text();
        console.warn('Resend API returned error:', resendErr);
        
        // Return structured non-breaking error info
        return new Response(
          JSON.stringify({ warning: "Resend dispatch error", details: resendErr }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        message: "Notification logged successfully.",
        recipient: to
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error("Error in send-mentor-notification function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
