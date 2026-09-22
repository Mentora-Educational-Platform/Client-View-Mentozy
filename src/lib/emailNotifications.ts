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
 * Uses Supabase Edge Function (`send-mentor-notification`) with backend RESEND_API_KEY.
 * Never exposes the Resend Secret Key to the client browser.
 */
export async function sendMentozyEmail(payload: EmailDispatchPayload): Promise<boolean> {
  const toRecipients = Array.isArray(payload.to) ? payload.to.filter(Boolean) : [payload.to].filter(Boolean);
  if (toRecipients.length === 0) return false;

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

      if (!error && data && !data.error) {
        console.info('[EmailNotifications] ✅ Email sent via Edge Function to:', toRecipients, 'ID:', data.id);
        return true;
      } else {
        console.warn('[EmailNotifications] ❌ Edge function email dispatch failed:', error || data?.error || data);
        return false;
      }
    } catch (edgeErr) {
      console.error('[EmailNotifications] ❌ Edge function exception:', edgeErr);
      return false;
    }
  }

  console.warn('[EmailNotifications] Supabase client unavailable for email dispatch');
  return false;
}

/**
 * Common HTML wrapper with Mentozy brand styling
 */
/**
 * Common HTML wrapper with Mentozy brand styling (Editorial Typewriter Aesthetic)
 */
function renderEmailWrapper(title: string, badge: string, contentHtml: string, actionButton?: { text: string; url: string }) {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      min-width: 100%;
      background-color: #F7F4EE;
      font-family: 'Courier New', Courier, Monaco, monospace;
      color: #3B2B20;
    }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: 0 !important; }
      .content-cell { padding: 30px 20px !important; }
      .nav-item { font-size: 11px !important; padding: 0 6px !important; }
      .headline { font-size: 24px !important; line-height: 30px !important; }
      .body-text { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F4EE;">

  <!-- Outer Background Container -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F7F4EE; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 35px 15px 45px 15px;">

        <!-- View in Browser Link -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin-bottom: 12px;">
          <tr>
            <td align="center" style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #8C827A; letter-spacing: 0.5px;">
              <a href="https://mentozy.app" style="color: #8C827A; text-decoration: underline;">View email in your browser</a>
            </td>
          </tr>
        </table>

        <!-- Main Card Container -->
        <table class="email-container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); overflow: hidden; border: 1px solid #ECE5DC;">
          <tr>
            <td class="content-cell" align="center" style="padding: 40px 35px 45px 35px;">

              <!-- Top Navigation Header -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                    <a href="https://mentozy.app" class="nav-item" style="color: #3B2B20; text-decoration: none; padding: 0 10px;">COURSES</a>
                    <a href="https://mentozy.app/community" class="nav-item" style="color: #3B2B20; text-decoration: none; padding: 0 10px;">COMMUNITY</a>
                    <a href="https://mentozy.app/explore" class="nav-item" style="color: #3B2B20; text-decoration: none; padding: 0 10px;">MENTORS</a>
                    <a href="https://mentozy.app/student-dashboard" class="nav-item" style="color: #3B2B20; text-decoration: none; padding: 0 10px;">DASHBOARD</a>
                  </td>
                </tr>
              </table>

              <!-- Circular Brand Emblem / Badge -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 32px; margin-bottom: 20px;">
                <tr>
                  <td align="center" style="width: 72px; height: 72px; border-radius: 50%; background-color: #3B2B20; color: #F7F4EE; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-align: center; vertical-align: middle; line-height: 14px; text-transform: uppercase;">
                    MENT<br>OZY
                  </td>
                </tr>
              </table>

              <!-- Badge Tag -->
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; padding: 3px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; border-radius: 4px; background-color: #F4EFEA; color: #5A4738; border: 1px solid #E5DCD2;">
                  ${badge}
                </span>
              </div>

              <!-- Main Title / Headline -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="headline" align="center" style="font-family: 'Courier New', Courier, Monaco, monospace; font-size: 26px; line-height: 34px; color: #3B2B20; font-weight: 700; letter-spacing: 0.5px; padding: 0 10px 18px 10px;">
                    ${title}
                  </td>
                </tr>
              </table>

              <!-- Content Body -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="body-text" align="left" style="font-family: 'Courier New', Courier, Monaco, monospace; font-size: 15px; line-height: 24px; color: #3B2B20; padding: 0 10px 24px 10px;">
                    ${contentHtml}
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              ${actionButton ? `
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top: 10px; margin-bottom: 30px;">
                <tr>
                  <td align="center" style="background-color: #3B2B20; border-radius: 6px;">
                    <a href="${actionButton.url}" target="_blank" style="display: inline-block; padding: 13px 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #FFFFFF; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
                      ${actionButton.text} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Bottom Navigation Links -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #F0EAE1; padding-top: 22px; margin-top: 10px;">
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                    <a href="https://mentozy.app" class="nav-item" style="color: #3B2B20; text-decoration: none; padding: 0 10px;">COURSES</a>
                    <a href="https://mentozy.app/community" class="nav-item" style="color: #3B2B20; text-decoration: none; padding: 0 10px;">COMMUNITY</a>
                    <a href="https://mentozy.app/explore" class="nav-item" style="color: #3B2B20; text-decoration: none; padding: 0 10px;">MENTORS</a>
                    <a href="https://mentozy.app/student-dashboard" class="nav-item" style="color: #3B2B20; text-decoration: none; padding: 0 10px;">DASHBOARD</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Social Links & Footer -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin-top: 28px;">
          
          <!-- Company Tagline -->
          <tr>
            <td align="center" style="font-family: 'Courier New', Courier, monospace; font-size: 11px; line-height: 16px; color: #6B6058; text-transform: uppercase; letter-spacing: 0.8px; padding-bottom: 14px;">
              MENTOZY PLATFORM &bull; Empowering Mentors &amp; Students Globally
            </td>
          </tr>

          <!-- Policy & Links -->
          <tr>
            <td align="center" style="font-family: 'Courier New', Courier, monospace; font-size: 10px; line-height: 16px; color: #8C827A; padding-bottom: 20px;">
              <a href="https://mentozy.app" style="color: #8C827A; text-decoration: none;">Visit Platform</a> &nbsp;&bull;&nbsp;
              <a href="https://mentozy.app" style="color: #8C827A; text-decoration: none;">Privacy Policy</a> &nbsp;&bull;&nbsp;
              <a href="https://mentozy.app" style="color: #8C827A; text-decoration: none;">Terms of Service</a>
            </td>
          </tr>

          <!-- Muted Watermark Bottom Badge -->
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width: 52px; height: 52px; border-radius: 50%; border: 1.5px solid #C4BCB3; color: #9E948B; font-family: 'Courier New', Courier, monospace; font-size: 9px; font-weight: 700; letter-spacing: 1px; text-align: center; vertical-align: middle; line-height: 11px; text-transform: uppercase;">
                    MENT<br>OZY
                  </td>
                </tr>
              </table>
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
    `New Message from ${params.senderName}`,
    'Direct Message',
    `
      <p style="margin-top: 0;">Hi <strong>${params.recipientName || 'there'}</strong>,</p>
      <p><strong>${params.senderName}</strong> ${roleBadge} sent you a new message on Mentozy:</p>
      
      <div style="background-color: #FBF9F6; border-left: 4px solid #3B2B20; border: 1px solid #ECE5DC; border-left-width: 4px; padding: 14px 18px; border-radius: 4px; margin: 18px 0; color: #3B2B20; font-style: italic; font-size: 14px;">
        "${params.messageSnippet}"
      </div>
      
      <p style="color: #6B6058; font-size: 13px;">Reply directly in the portal to keep your conversation going.</p>
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

      <div style="background-color: #FBF9F6; border: 1px solid #ECE5DC; border-radius: 6px; padding: 16px; margin: 18px 0;">
        <div style="font-size: 16px; font-weight: 700; color: #3B2B20; margin-bottom: 8px;">
          📌 ${params.taskTitle}
        </div>
        ${params.courseName ? `<div style="font-size: 13px; color: #6B6058; margin-bottom: 4px;"><strong>Course:</strong> ${params.courseName}</div>` : ''}
        ${params.dueDate ? `<div style="font-size: 13px; color: #8A4B1A; margin-bottom: 4px;"><strong>Due Date:</strong> ${new Date(params.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>` : ''}
        ${params.instructions ? `<div style="font-size: 13px; color: #3B2B20; margin-top: 8px; border-top: 1px solid #ECE5DC; padding-top: 8px; font-style: italic;">${params.instructions}</div>` : ''}
      </div>

      <p style="color: #6B6058; font-size: 13px;">Please complete and submit your work before the deadline.</p>
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
      <div style="margin-bottom: 12px;">
        <span style="font-size: 13px; color: #6B6058;">
          Published by <strong>${params.authorName || params.orgName || 'Organization Admin'}</strong>
        </span>
      </div>

      <div style="background-color: #FBF9F6; border: 1px solid ${isUrgent ? '#991B1B' : '#ECE5DC'}; border-radius: 6px; padding: 18px; margin: 18px 0; color: #3B2B20; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
        ${params.content}
      </div>

      <p style="color: #6B6058; font-size: 13px;">Stay up to date with your organization notices in your Mentozy dashboard.</p>
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
    `New reply to your discussion`,
    'Community Forum',
    `
      <p style="margin-top: 0;">Hi <strong>${params.recipientName || 'there'}</strong>,</p>
      <p><strong>${params.authorName}</strong> replied to your discussion <em>"${params.postTitle}"</em>:</p>

      <div style="background-color: #FBF9F6; border-left: 4px solid #3B2B20; border: 1px solid #ECE5DC; border-left-width: 4px; padding: 14px 18px; border-radius: 4px; margin: 18px 0; color: #3B2B20; font-size: 14px; font-style: italic;">
        "${params.replySnippet}"
      </div>

      <p style="color: #6B6058; font-size: 13px;">Join the discussion and reply to continue the conversation.</p>
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

      <div style="background-color: #FBF9F6; border: 1px solid ${isPassed ? '#15803D' : '#B45309'}; border-radius: 6px; padding: 16px; margin: 18px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 15px; font-weight: 700; color: ${isPassed ? '#15803D' : '#B45309'};">
            ${isPassed ? '✅ Status: Passed' : '🔄 Status: Redo / Revision Required'}
          </span>
          ${params.score !== undefined ? `<span style="margin-left: auto; font-size: 14px; color: #6B6058;">Score: <strong>${params.score}/100</strong></span>` : ''}
        </div>
        
        ${params.feedbackNote ? `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ECE5DC; font-size: 13px; color: #3B2B20; line-height: 1.5; font-style: italic;">
            <strong>Mentor Feedback:</strong><br>
            "${params.feedbackNote}"
          </div>
        ` : ''}
      </div>

      <p style="color: #6B6058; font-size: 13px;">
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
