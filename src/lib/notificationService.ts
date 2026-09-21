import { supabase, getSupabase } from './supabase';

export type NotificationType = 
  | 'message'
  | 'announcement'
  | 'forum_reply'
  | 'task'
  | 'task_submission'
  | 'grade'
  | 'assessment'
  | 'live_session'
  | 'event'
  | 'teacher_invitation'
  | 'invitation_accepted';

export interface NotificationRecord {
  id: string;
  recipient_id: string;
  actor_id?: string | null;
  org_id?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  is_read: boolean;
  source_type?: string | null;
  source_id?: string | null;
  created_at: string;
}

export interface DispatchNotificationParams {
  recipientId: string;
  actorId?: string | null;
  orgId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  sourceType?: string;
  sourceId?: string;
  emailAction?: () => Promise<boolean>;
}

export interface BulkDispatchNotificationParams {
  recipientIds: string[];
  actorId?: string | null;
  orgId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  sourceType?: string;
  sourceId?: string;
  emailAction?: () => Promise<boolean>;
}

/**
 * Dispatches a single in-app notification and optionally triggers an email notification.
 * Email dispatch runs in the background and will never cause the database notification to fail.
 */
export async function dispatchNotification(params: DispatchNotificationParams): Promise<NotificationRecord | null> {
  const client = getSupabase() || supabase;
  if (!client) return null;

  // Senders/actors should not receive notifications for their own actions
  if (params.actorId && params.actorId === params.recipientId) {
    return null;
  }

  let createdRecord: NotificationRecord | null = null;

  try {
    const { data, error } = await client
      .from('notifications')
      .insert({
        recipient_id: params.recipientId,
        actor_id: params.actorId || null,
        org_id: params.orgId || null,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link || null,
        source_type: params.sourceType || null,
        source_id: params.sourceId || null,
        is_read: false,
      })
      .select('*')
      .single();

    if (error) {
      console.warn('[NotificationService] Error inserting notification:', error);
    } else {
      createdRecord = data as NotificationRecord;
    }
  } catch (err) {
    console.error('[NotificationService] Database insert exception:', err);
  }

  // Server-side email dispatch in background (never blocks or breaks core action)
  if (params.emailAction) {
    (async () => {
      try {
        await params.emailAction!();
      } catch (emailErr) {
        console.warn('[NotificationService] Background email dispatch error:', emailErr);
      }
    })();
  }

  return createdRecord;
}

/**
 * Dispatches notifications to multiple recipients (e.g. Org Announcements, Class alerts).
 * Creates individual notification rows for each recipient.
 */
export async function dispatchBulkNotifications(params: BulkDispatchNotificationParams): Promise<number> {
  const client = getSupabase() || supabase;
  if (!client || !params.recipientIds || params.recipientIds.length === 0) return 0;

  // Filter out the actor and deduplicate
  const uniqueRecipients = Array.from(new Set(
    params.recipientIds.filter(id => id && id !== params.actorId)
  ));

  if (uniqueRecipients.length === 0) return 0;

  const rows = uniqueRecipients.map(recipientId => ({
    recipient_id: recipientId,
    actor_id: params.actorId || null,
    org_id: params.orgId || null,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link || null,
    source_type: params.sourceType || null,
    source_id: params.sourceId || null,
    is_read: false,
  }));

  try {
    const { error } = await client.from('notifications').insert(rows);
    if (error) {
      console.warn('[NotificationService] Error inserting bulk notifications:', error);
    }
  } catch (err) {
    console.error('[NotificationService] Bulk insert exception:', err);
  }

  // Background broadcast email
  if (params.emailAction) {
    (async () => {
      try {
        await params.emailAction!();
      } catch (emailErr) {
        console.warn('[NotificationService] Background bulk email error:', emailErr);
      }
    })();
  }

  return uniqueRecipients.length;
}

/**
 * Loads the current user's notifications.
 */
export async function fetchUserNotifications(userId: string, limit = 30): Promise<NotificationRecord[]> {
  const client = getSupabase() || supabase;
  if (!client || !userId) return [];

  try {
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[NotificationService] Error fetching notifications:', error);
      return [];
    }

    return (data as NotificationRecord[]) || [];
  } catch (err) {
    console.error('[NotificationService] Fetch notifications exception:', err);
    return [];
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const client = getSupabase() || supabase;
  if (!client || !notificationId) return false;

  try {
    const { error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return !error;
  } catch (err) {
    console.warn('[NotificationService] Error marking as read:', err);
    return false;
  }
}

/**
 * Marks all unread notifications as read for a user.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const client = getSupabase() || supabase;
  if (!client || !userId) return false;

  try {
    const { error } = await client
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    return !error;
  } catch (err) {
    console.warn('[NotificationService] Error marking all as read:', err);
    return false;
  }
}
