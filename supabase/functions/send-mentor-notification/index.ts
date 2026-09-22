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
      const sender = 'Mentozy <no-reply@mentozy.app>';
      
      const rawRecipients = Array.isArray(to) ? to : [to];
      const validRecipients = Array.from(new Set(
        rawRecipients
          .map((e: any) => String(e || '').trim())
          .filter((e: string) => e.length >= 5 && e.includes('@') && !e.includes(' ') && e.toLowerCase() !== 'no email')
      ));

      if (validRecipients.length === 0) {
        return new Response(
          JSON.stringify({ error: "No valid recipient email addresses provided", raw: to }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Dispatch to each recipient (concurrently via Promise.allSettled)
      const results = await Promise.allSettled(
        validRecipients.map(async (recipientEmail: string) => {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: sender,
              to: [recipientEmail],
              subject: subject,
              html: html,
              text: text || undefined,
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Resend failed for ${recipientEmail}: ${errText}`);
          }
          return await res.json();
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      if (successful.length > 0) {
        return new Response(
          JSON.stringify({ 
            message: `Dispatched ${successful.length}/${validRecipients.length} emails via Resend`,
            sentCount: successful.length,
            recipients: validRecipients,
            failures: failed.map(f => (f as PromiseRejectedResult).reason?.message)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } else {
        const errors = failed.map(f => (f as PromiseRejectedResult).reason?.message).join('; ');
        console.error('All Resend dispatches failed:', errors);
        return new Response(
          JSON.stringify({ error: "Resend dispatch failed for all recipients", details: errors }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
        );
      }
    }

  } catch (error) {
    console.error("Error in send-mentor-notification function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
