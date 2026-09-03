import { supabase } from './supabase';

export interface NotificationPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  metadata?: Record<string, any>;
}

/**
 * Dispatches notification emails server-side via Supabase Edge Function (Resend).
 * Never exposes API keys or secrets in client-side code.
 * Safe try-catch ensures database operations never fail if email dispatch fails.
 */
export async function sendAdminNotification(payload: NotificationPayload): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data, error } = await supabase.functions.invoke('send-mentor-notification', {
      body: payload
    });

    if (error) {
      console.warn('[Notifications] Edge function response:', error);
      // Try fallback to send-email function if available
      const { error: fallbackError } = await supabase.functions.invoke('send-email', {
        body: payload
      });
      if (fallbackError) {
        console.warn('[Notifications] Fallback notification status:', fallbackError);
      }
    }
    return !error;
  } catch (err) {
    console.warn('[Notifications] Notification dispatch skipped safely:', err);
    return false;
  }
}

/**
 * Template: New Application submitted by applicant -> sent to founder@mentozy.app
 */
export function buildNewApplicationEmail(app: {
  fullName: string;
  email: string;
  primaryExpertise: string;
  applicationNumber: string;
  submittedAt: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          🚀 New Mentor Application Received
        </h2>
        <p style="font-weight: bold; font-size: 14px;">A new mentor application has been submitted on Mentozy.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Applicant</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${app.fullName} (${app.email})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Application ID</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${app.applicationNumber}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Primary Expertise</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${app.primaryExpertise}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Submitted At</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(app.submittedAt).toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Status</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><span style="background: #FEF3C7; padding: 2px 6px; font-weight: bold;">Under Review</span></td>
          </tr>
        </table>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/admin/mentor-applications" style="display: inline-block; background: #f39c12; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Review Application in Admin Dashboard →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Template: Needs More Information -> sent to Applicant
 */
export function buildNeedsInfoEmail(app: {
  fullName: string;
  applicationNumber: string;
  requestMessage: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          ⚠️ Action Required — Mentozy Mentor Application
        </h2>
        <p style="font-weight: bold; font-size: 14px;">Hi ${app.fullName},</p>
        <p style="font-size: 13px; line-height: 1.6;">
          The Mentozy team has reviewed your mentor application (<strong>${app.applicationNumber}</strong>) and needs some additional information before we can continue the review:
        </p>
        
        <div style="background: #FFFBEB; border: 2px solid #111; padding: 14px; margin: 16px 0; font-size: 13px; font-weight: bold; color: #92400E;">
          <span style="text-transform: uppercase; display: block; font-size: 11px; margin-bottom: 4px;">Request from Admissions Team:</span>
          "${app.requestMessage}"
        </div>

        <p style="font-size: 13px; line-height: 1.6;">
          Please respond securely through your Mentozy Application Portal.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/mentor/application" style="display: inline-block; background: #f39c12; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Respond to Request in Portal →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Template: Applicant Response Submitted -> sent to founder@mentozy.app
 */
export function buildApplicantResponseEmail(app: {
  fullName: string;
  applicationNumber: string;
  responseMessage: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          💬 Mentor Application Response Received
        </h2>
        <p style="font-weight: bold; font-size: 14px;">The applicant has responded to your information request.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Applicant</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${app.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Application ID</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${app.applicationNumber}</strong></td>
          </tr>
        </table>

        <div style="background: #F0FDF4; border: 2px solid #111; padding: 14px; margin: 16px 0; font-size: 13px; font-weight: bold; color: #166534;">
          <span style="text-transform: uppercase; display: block; font-size: 11px; margin-bottom: 4px;">Applicant Response:</span>
          "${app.responseMessage}"
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/admin/mentor-applications" style="display: inline-block; background: #f39c12; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Review Application & Decision →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Template: Application Approved -> sent to Applicant
 */
export function buildApprovalEmail(app: {
  fullName: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          🎉 Congratulations! You are Approved as a Mentozy Mentor
        </h2>
        <p style="font-weight: bold; font-size: 14px;">Hello ${app.fullName},</p>
        
        <p style="font-size: 13px; line-height: 1.6;">
          Congratulations! Your application to become a mentor on Mentozy has been approved by our academic admissions committee.
        </p>

        <p style="font-size: 13px; line-height: 1.6;">
          You can now access your Mentor Dashboard, set your availability schedule, create courses, and connect with eager learners.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/mentor-dashboard" style="display: inline-block; background: #10B981; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Go to Mentor Dashboard →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Template: Application Rejected -> sent to Applicant
 */
export function buildRejectionEmail(app: {
  fullName: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          Update Regarding Your Mentozy Mentor Application
        </h2>
        <p style="font-weight: bold; font-size: 14px;">Hello ${app.fullName},</p>
        
        <p style="font-size: 13px; line-height: 1.6;">
          Thank you for taking the time to apply to become an individual mentor on Mentozy.
        </p>

        <p style="font-size: 13px; line-height: 1.6;">
          After careful consideration by our admissions team, we are unable to approve your application at this time due to current curriculum balance and intake limits.
        </p>

        <p style="font-size: 13px; line-height: 1.6;">
          We sincerely appreciate your interest and wish you the best in your teaching journey.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/" style="display: inline-block; background: #eff3ff; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Return to Mentozy →
          </a>
        </div>
      </div>
    </div>
  `;
}

/* =========================================================================
   KRISHNAITE 18-DAY AI COURSE EMAIL TEMPLATES
   ========================================================================= */

/**
 * 1. New Krishnaite Application Submitted -> sent to Admissions/Admin
 */
export function buildKrishnaiteNewApplicationEmail(app: {
  fullName: string;
  email: string;
  applicationId: string;
  submittedAt: string;
  educationStatus?: string;
  scholarshipPercentage?: number;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <div style="display: inline-block; background: #f39c12; color: #111; padding: 4px 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; border: 2px solid #111; margin-bottom: 12px;">
          Krishnaite 18-Day AI Course
        </div>
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          ✨ New Course Application Submitted
        </h2>
        <p style="font-weight: bold; font-size: 14px;">A new applicant has applied for the 18-Day Practical AI Course.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Applicant</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${app.fullName} (${app.email})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Application ID</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${app.applicationId}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Status</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><span style="background: #FEF3C7; padding: 2px 6px; font-weight: bold;">Under Review</span></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Scholarship Tier</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${app.scholarshipPercentage || 50}% Scholarship (₹10,000 → ₹5,000)</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Submitted At</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date(app.submittedAt).toLocaleString()}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/admin/krishnaite-applications" style="display: inline-block; background: #f39c12; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Open Review Dossier in Admin Station →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * 2. Krishnaite Needs More Information -> sent to Applicant
 */
export function buildKrishnaiteNeedsInfoEmail(app: {
  fullName: string;
  applicationId: string;
  requestMessage: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <div style="display: inline-block; background: #FCD34D; color: #111; padding: 4px 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; border: 2px solid #111; margin-bottom: 12px;">
          Krishnaite Action Required
        </div>
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          ⚠️ Information Requested for 18-Day AI Course
        </h2>
        <p style="font-weight: bold; font-size: 14px;">Hi ${app.fullName},</p>
        <p style="font-size: 13px; line-height: 1.6;">
          The Krishnaite admissions committee has reviewed your 18-Day AI Course application (<strong>${app.applicationId}</strong>) and requested additional details:
        </p>
        
        <div style="background: #FFFBEB; border: 2px solid #111; padding: 14px; margin: 16px 0; font-size: 13px; font-weight: bold; color: #92400E;">
          <span style="text-transform: uppercase; display: block; font-size: 11px; margin-bottom: 4px;">Admissions Request:</span>
          "${app.requestMessage}"
        </div>

        <p style="font-size: 13px; line-height: 1.6;">
          Please open your Krishnaite Applicant Portal to provide your response directly.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/krishnaite/application" style="display: inline-block; background: #f39c12; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Respond in Applicant Portal →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * 3. Krishnaite Applicant Responded -> sent to Admissions/Admin
 */
export function buildKrishnaiteApplicantRespondedEmail(app: {
  fullName: string;
  applicationId: string;
  responseMessage: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          💬 Krishnaite Applicant Response Received
        </h2>
        <p style="font-weight: bold; font-size: 14px;">The applicant has responded to the information request.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Applicant</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${app.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Application ID</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${app.applicationId}</strong></td>
          </tr>
        </table>

        <div style="background: #F0FDF4; border: 2px solid #111; padding: 14px; margin: 16px 0; font-size: 13px; font-weight: bold; color: #166534;">
          <span style="text-transform: uppercase; display: block; font-size: 11px; margin-bottom: 4px;">Applicant Response:</span>
          "${app.responseMessage}"
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/admin/krishnaite-applications" style="display: inline-block; background: #f39c12; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Open Review Station →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * 4. Krishnaite Application Accepted -> sent to Applicant
 */
export function buildKrishnaiteAcceptedEmail(app: {
  fullName: string;
  applicationId: string;
  scholarshipPercentage: number;
  payableAmount: number;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <div style="display: inline-block; background: #10B981; color: #fff; padding: 4px 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; border: 2px solid #111; margin-bottom: 12px;">
          Application Accepted
        </div>
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          🎉 Congratulations! You are Accepted into the 18-Day AI Course
        </h2>
        <p style="font-weight: bold; font-size: 14px;">Hello ${app.fullName},</p>
        
        <p style="font-size: 13px; line-height: 1.6;">
          Congratulations! Your application (<strong>${app.applicationId}</strong>) has been officially approved by the Krishnaite admissions committee.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Course Value</td>
            <td style="padding: 8px; border: 1px solid #ddd;">₹10,000</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Awarded Scholarship</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${app.scholarshipPercentage}% Scholarship</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Payable Fee</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>₹${app.payableAmount.toLocaleString()}</strong></td>
          </tr>
        </table>

        <p style="font-size: 13px; line-height: 1.6;">
          You can track your cohort onboarding and enrollment details from your applicant dashboard.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/krishnaite/application" style="display: inline-block; background: #10B981; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            View Applicant Dashboard →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * 5. Krishnaite Application Declined -> sent to Applicant
 */
export function buildKrishnaiteDeclinedEmail(app: {
  fullName: string;
  applicationId: string;
  feedback?: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          Update on Your Krishnaite 18-Day AI Course Application
        </h2>
        <p style="font-weight: bold; font-size: 14px;">Hello ${app.fullName},</p>
        
        <p style="font-size: 13px; line-height: 1.6;">
          Thank you for applying for the Krishnaite 18-Day Practical AI Course (<strong>${app.applicationId}</strong>).
        </p>

        <p style="font-size: 13px; line-height: 1.6;">
          Due to cohort capacity and participant allocation limits, we are unable to offer you admission in this specific cohort.
        </p>

        ${app.feedback ? `
        <div style="background: #F3F4F6; border: 2px solid #111; padding: 12px; margin: 16px 0; font-size: 13px;">
          <strong>Feedback from Admissions:</strong><br />
          "${app.feedback}"
        </div>
        ` : ''}

        <p style="font-size: 13px; line-height: 1.6;">
          We encourage you to explore upcoming Krishnaite workshops and community tracks.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/academy" style="display: inline-block; background: #eff3ff; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Return to Academy →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * 6. AIvantage Winner Direct Invitation -> sent to Winner
 */
export function buildKrishnaiteAIvantageWinnerInvitationEmail(app: {
  fullName: string;
  applicationId: string;
  email: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <div style="display: inline-block; background: #10B981; color: #fff; padding: 4px 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; border: 2px solid #111; margin-bottom: 12px;">
          🏆 AIvantage Quiz Winner — 100% Scholarship
        </div>
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          You Are Invited! 18-Day AI Course (100% Free)
        </h2>
        <p style="font-weight: bold; font-size: 14px;">Congratulations ${app.fullName}!</p>
        
        <p style="font-size: 13px; line-height: 1.6;">
          As one of the first 40 winners of the AIvantage Quiz, you have been selected for a <strong>100% Scholarship (₹10,000 → ₹0, Completely Free)</strong> for the Krishnaite 18-Day Practical AI Course.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Invitation ID</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>${app.applicationId}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Scholarship</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>100% Free (AIvantage Quiz Winner)</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #eff3ff;">Fee Payable</td>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong style="color: #10B981;">₹0</strong></td>
          </tr>
        </table>

        <p style="font-size: 13px; line-height: 1.6;">
          Your seat in the first cohort is reserved. Access your portal below to confirm your spot.
        </p>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://mentozy.app/krishnaite/application" style="display: inline-block; background: #f39c12; color: #111; border: 3px solid #111; padding: 12px 24px; font-weight: bold; text-decoration: none; text-transform: uppercase; box-shadow: 3px 3px 0px #111;">
            Access Winner Portal →
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Template: Organization Account Provisioned & Welcome Email
 */
export function buildOrganizationProvisionedEmail(org: {
  orgName: string;
  email: string;
  temporaryPassword?: string;
  loginUrl: string;
  contactPerson?: string;
}) {
  return `
    <div style="font-family: monospace, sans-serif; background: #FAF9F6; padding: 24px; color: #111;">
      <div style="max-width: 600px; margin: auto; background: #fff; border: 4px solid #111; padding: 24px; box-shadow: 6px 6px 0px #111;">
        <div style="background: #f39c12; color: #111; padding: 8px 12px; font-weight: 900; font-size: 11px; text-transform: uppercase; display: inline-block; margin-bottom: 16px;">
          🏫 MENTOZY PARTNERSHIP • ACCOUNT PROVISIONED
        </div>
        <h2 style="text-transform: uppercase; margin-top: 0; color: #111; border-bottom: 3px solid #111; padding-bottom: 8px;">
          Welcome, ${org.orgName}!
        </h2>
        <p style="font-weight: bold; font-size: 14px;">Dear ${org.contactPerson || org.orgName} Team,</p>
        <p style="font-size: 13px; line-height: 1.6;">
          Your partnership with Mentozy has been approved, and your dedicated <strong>Organization Portal</strong> has been officially provisioned.
        </p>

        <div style="background: #eff3ff; border: 2px solid #111; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-weight: bold; color: #111; font-size: 13px;">🔑 Your Organization Credentials:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Organization:</td>
              <td>${org.orgName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Official Login Email:</td>
              <td><strong>${org.email}</strong></td>
            </tr>
            ${org.temporaryPassword ? `
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Temporary Password:</td>
              <td><code style="background: #fff; padding: 2px 6px; border: 1px solid #111; font-weight: bold;">${org.temporaryPassword}</code></td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Organization Login URL:</td>
              <td><a href="${org.loginUrl}" style="color: #4338ca; font-weight: bold;">${org.loginUrl}</a></td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; line-height: 1.6;">
          You can now log in to manage your teachers, enroll students, schedule live sessions, and deploy courses within your branded organization workspace.
        </p>

        <div style="margin: 24px 0; text-align: center;">
          <a href="${org.loginUrl}" style="display: inline-block; background: #f39c12; color: #111; font-weight: 900; text-transform: uppercase; text-decoration: none; padding: 12px 24px; border: 2px solid #111; box-shadow: 3px 3px 0px #111;">
            LOG IN TO ORGANIZATION WORKSPACE →
          </a>
        </div>

        <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 12px; margin-top: 24px;">
          Mentozy Partnerships Team • founder@mentozy.app
        </p>
      </div>
    </div>
  `;
}


