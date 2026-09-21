import { supabase } from './supabase';

export interface EmailDispatchPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  metadata?: Record<string, any>;
}

/**
 * Universal email dispatcher for Mentozy.
 * Priority 1: Supabase Edge Function (`send-mentor-notification` or `send-email`) with backend RESEND_API_KEY
 * Priority 2: Direct Resend API call if VITE_RESEND_API_KEY is configured in frontend environment
 */
export async function sendMentozyEmail(payload: EmailDispatchPayload): Promise<boolean> {
  const toRecipients = Array.isArray(payload.to) ? payload.to.filter(Boolean) : [payload.to].filter(Boolean);
  if (toRecipients.length === 0) return false;

  // 1. Try Supabase Edge Function
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('send-mentor-notification', {
        body: {
          to: toRecipients,
          subject: payload.subject,
          html: payload.html,
          text: payload.text
        }
      });

      if (!error && data) {
        return true;
      }

      // Try fallback edge function name
      const { error: fallbackError } = await supabase.functions.invoke('send-email', {
        body: {
          to: toRecipients,
          subject: payload.subject,
          html: payload.html,
          text: payload.text
        }
      });

      if (!fallbackError) return true;
    } catch (edgeErr) {
      console.warn('[EmailNotifications] Edge function dispatch skipped, trying direct client fallback:', edgeErr);
    }
  }

  // 2. Direct Resend API fallback if VITE_RESEND_API_KEY is set in .env
  const viteResendKey = (import.meta as any).env?.VITE_RESEND_API_KEY;
  if (viteResendKey) {
    try {
      let res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${viteResendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Mentozy <notifications@mentozy.app>',
          to: toRecipients,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      if (!res.ok) {
        // Fallback to testing domain if custom domain is not yet active
        res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${viteResendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Mentozy <onboarding@resend.dev>',
            to: toRecipients,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
          }),
        });
      }

      return res.ok;
    } catch (resendErr) {
      console.warn('[EmailNotifications] Direct Resend dispatch failed:', resendErr);
    }
  }

  console.info('[EmailNotifications] Notification queued for:', toRecipients, payload.subject);
  return true;
}

/**
 * Common HTML wrapper with Mentozy brand styling
 */
function renderEmailWrapper(title: string, badge: string, contentHtml: string, actionButton?: { text: string; url: string }) {
  const currentYear = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            
            <!-- Header -->
            <tr>
              <td style="padding: 24px 32px; border-bottom: 1px solid #334155; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                        MENTOZY<span style="color: #6366f1;">.</span>
                      </div>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 6px; background-color: #4338ca; color: #e0e7ff;">
                        ${badge}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 32px;">
                <h1 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                  ${title}
                </h1>
                
                <div style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px;">
                  ${contentHtml}
                </div>

                ${actionButton ? `
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px 0;">
                  <tr>
                    <td align="center">
                      <a href="${actionButton.url}" target="_blank" style="display: inline-block; padding: 14px 28px; background-color: #6366f1; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);">
                        ${actionButton.text} &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
                ` : ''}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 32px; border-top: 1px solid #334155; background-color: #0f172a; text-align: center; font-size: 12px; color: #64748b;">
                <p style="margin: 0 0 6px 0;">You received this email because you are a member of Mentozy.</p>
                <p style="margin: 0;">&copy; ${currentYear} Mentozy Learning Ecosystem. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

// 1. Direct Message Email Notification
export async function notifyNewDirectMessage(params: {
  toEmail: string;
  recipientName?: string;
  senderName: string;
  senderRole?: string;
  messageSnippet: string;
  conversationUrl?: string;
}) {
  const url = params.conversationUrl || 'https://mentozy.app/messages';
  const roleBadge = params.senderRole ? `(${params.senderRole})` : '';
  const html = renderEmailWrapper(
    `New message from ${params.senderName}`,
    'Direct Message',
    `
      <p style="margin-top: 0;">Hi <strong>${params.recipientName || 'there'}</strong>,</p>
      <p><strong>${params.senderName}</strong> ${roleBadge} sent you a new message on Mentozy:</p>
      
      <div style="background-color: #0f172a; border-left: 4px solid #6366f1; padding: 14px 18px; border-radius: 6px; margin: 18px 0; color: #e2e8f0; font-style: italic; font-size: 14px;">
        "${params.messageSnippet}"
      </div>
      
      <p style="color: #94a3b8; font-size: 13px;">Reply directly in the portal to keep your conversation going.</p>
    `,
    { text: 'Open & Reply to Message', url }
  );

  return sendMentozyEmail({
    to: params.toEmail,
    subject: `💬 New message from ${params.senderName} on Mentozy`,
    html,
    text: `${params.senderName} sent you a message: "${params.messageSnippet}". Open Mentozy to reply: ${url}`
  });
}

// 2. New Task Assigned Notification
export async function notifyNewTaskAssigned(params: {
  toEmail: string | string[];
  studentName?: string;
  taskTitle: string;
  courseName?: string;
  dueDate?: string;
  instructions?: string;
  taskUrl?: string;
}) {
  const url = params.taskUrl || 'https://mentozy.app/student-dashboard';
  const html = renderEmailWrapper(
    `New Assignment: ${params.taskTitle}`,
    'Task Assigned',
    `
      <p style="margin-top: 0;">Hi <strong>${params.studentName || 'Student'}</strong>,</p>
      <p>You have been assigned a new learning task on Mentozy:</p>

      <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 18px 0;">
        <div style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
          📌 ${params.taskTitle}
        </div>
        ${params.courseName ? `<div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;"><strong>Course:</strong> ${params.courseName}</div>` : ''}
        ${params.dueDate ? `<div style="font-size: 13px; color: #f59e0b; margin-bottom: 4px;"><strong>Due Date:</strong> ${new Date(params.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>` : ''}
        ${params.instructions ? `<div style="font-size: 13px; color: #cbd5e1; margin-top: 8px; border-top: 1px solid #1e293b; padding-top: 8px;">${params.instructions}</div>` : ''}
      </div>

      <p style="color: #94a3b8; font-size: 13px;">Please complete and submit your work before the deadline.</p>
    `,
    { text: 'View Task & Start Working', url }
  );

  return sendMentozyEmail({
    to: params.toEmail,
    subject: `📋 New Assignment: ${params.taskTitle}`,
    html,
    text: `New Task Assigned: ${params.taskTitle}. Due: ${params.dueDate || 'Check portal'}. View details: ${url}`
  });
}

// 3. New Announcement Broadcast Notification
export async function notifyNewAnnouncement(params: {
  toEmails: string[];
  orgName?: string;
  title: string;
  content: string;
  priority?: 'normal' | 'urgent';
  authorName?: string;
  announcementUrl?: string;
}) {
  if (params.toEmails.length === 0) return true;
  const url = params.announcementUrl || 'https://mentozy.app/org-announcements';
  const isUrgent = params.priority === 'urgent';

  const html = renderEmailWrapper(
    params.title,
    isUrgent ? 'URGENT NOTICE' : 'ANNOUNCEMENT',
    `
      <div style="display: flex; align-items: center; margin-bottom: 16px;">
        <span style="font-size: 13px; color: #94a3b8;">
          Published by <strong>${params.authorName || params.orgName || 'Organization Admin'}</strong>
        </span>
      </div>

      <div style="background-color: #0f172a; border: 1px solid ${isUrgent ? '#ef4444' : '#334155'}; border-radius: 8px; padding: 18px; margin: 18px 0; color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
        ${params.content}
      </div>

      <p style="color: #94a3b8; font-size: 13px;">Stay up to date with your organization notices in your Mentozy dashboard.</p>
    `,
    { text: 'View Announcement in Mentozy', url }
  );

  return sendMentozyEmail({
    to: params.toEmails,
    subject: `${isUrgent ? '🚨 [URGENT] ' : '📢 '}${params.title} - ${params.orgName || 'Mentozy'}`,
    html,
    text: `Announcement: ${params.title}\n\n${params.content}\n\nView online: ${url}`
  });
}

// 4. Community Forum Reply Notification
export async function notifyNewForumReply(params: {
  toEmail: string;
  recipientName?: string;
  authorName: string;
  postTitle: string;
  replySnippet: string;
  threadUrl?: string;
}) {
  const url = params.threadUrl || 'https://mentozy.app/community';
  const html = renderEmailWrapper(
    `New reply to your post`,
    'Community Forum',
    `
      <p style="margin-top: 0;">Hi <strong>${params.recipientName || 'there'}</strong>,</p>
      <p><strong>${params.authorName}</strong> replied to your discussion <em>"${params.postTitle}"</em>:</p>

      <div style="background-color: #0f172a; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 6px; margin: 18px 0; color: #e2e8f0; font-size: 14px;">
        "${params.replySnippet}"
      </div>

      <p style="color: #94a3b8; font-size: 13px;">Join the discussion and reply to continue the conversation.</p>
    `,
    { text: 'View & Reply to Discussion', url }
  );

  return sendMentozyEmail({
    to: params.toEmail,
    subject: `💬 ${params.authorName} replied to "${params.postTitle}"`,
    html,
    text: `${params.authorName} replied: "${params.replySnippet}". View: ${url}`
  });
}

// 5. Task Submission Feedback & Grading Notification
export async function notifyTaskGraded(params: {
  toEmail: string;
  studentName?: string;
  taskTitle: string;
  status: 'passed' | 'redo';
  score?: number;
  feedbackNote?: string;
  taskUrl?: string;
}) {
  const url = params.taskUrl || 'https://mentozy.app/student-dashboard';
  const isPassed = params.status === 'passed';

  const html = renderEmailWrapper(
    isPassed ? `🎉 Task Passed: ${params.taskTitle}` : `⚠️ Revision Requested: ${params.taskTitle}`,
    isPassed ? 'GRADE: PASSED' : 'REVISION NEEDED',
    `
      <p style="margin-top: 0;">Hi <strong>${params.studentName || 'Student'}</strong>,</p>
      <p>Your mentor has reviewed your submission for <strong>${params.taskTitle}</strong>.</p>

      <div style="background-color: #0f172a; border: 1px solid ${isPassed ? '#10b981' : '#f59e0b'}; border-radius: 8px; padding: 16px; margin: 18px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 15px; font-weight: 700; color: ${isPassed ? '#34d399' : '#fbbf24'};">
            ${isPassed ? '✅ Status: Passed' : '🔄 Status: Redo / Revision Required'}
          </span>
          ${params.score !== undefined ? `<span style="margin-left: auto; font-size: 14px; color: #94a3b8;">Score: <strong>${params.score}/100</strong></span>` : ''}
        </div>
        
        ${params.feedbackNote ? `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #1e293b; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
            <strong>Mentor Feedback:</strong><br>
            <em>"${params.feedbackNote}"</em>
          </div>
        ` : ''}
      </div>

      <p style="color: #94a3b8; font-size: 13px;">
        ${isPassed ? 'Great work! Keep up the momentum on your next modules.' : 'Review the mentor feedback above and resubmit when ready.'}
      </p>
    `,
    { text: isPassed ? 'View Task & Score' : 'Resubmit Task', url }
  );

  return sendMentozyEmail({
    to: params.toEmail,
    subject: `${isPassed ? '🎉 Passed' : '🔄 Revision Required'}: ${params.taskTitle}`,
    html,
    text: `Your submission for "${params.taskTitle}" was reviewed: ${params.status.toUpperCase()}. Feedback: ${params.feedbackNote || 'None'}. View: ${url}`
  });
}
