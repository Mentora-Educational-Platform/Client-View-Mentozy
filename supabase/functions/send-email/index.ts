import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, subject, html, text } = await req.json();

        if (!to || !subject || (!html && !text)) {
            return new Response(
                JSON.stringify({ error: "Missing required fields: to, subject, and html/text" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
        }

        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        if (!smtpPassword) {
            console.error('Missing SMTP_PASSWORD environment variable');
            return new Response(
                JSON.stringify({ error: "Server configuration error: Missing SMTP credentials" }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'wearementozy@gmail.com',
                pass: smtpPassword,
            },
        });

        const info = await transporter.sendMail({
            from: '"Mentozy Team" <wearementozy@gmail.com>',
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        console.log("Message sent: %s", info.messageId);

        return new Response(
            JSON.stringify({ message: "Email sent successfully", messageId: info.messageId }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error) {
        console.error("Error sending email:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return new Response(
            JSON.stringify({ error: errorMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});
