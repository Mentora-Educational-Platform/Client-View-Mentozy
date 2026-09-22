import { supabase, getSupabase } from './supabase';

export type NotificationType = 
  | 'message'
  | 'announcement'
  | 'forum_reply'
  | 'forum_post'
  | 'community'
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
    // 1. Try secure Postgres RPC function
    const { data: rpcData, error: rpcErr } = await client.rpc('create_notification', {
      p_recipient_id: params.recipientId,
      p_type: params.type,
      p_title: params.title,
      p_body: params.body,
      p_link: params.link || null,
      p_actor_id: params.actorId || null,
      p_org_id: params.orgId || null,
      p_source_type: params.sourceType || null,
      p_source_id: params.sourceId || null,
    });

    if (rpcErr) {
      // 2. Direct INSERT fallback (without .select to avoid sender SELECT RLS violation)
      const { error: insertErr } = await client.from('notifications').insert({
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
      });

      if (insertErr) {
        console.warn('[NotificationService] Insert error:', insertErr);
      }
    } else if (rpcData) {
      createdRecord = {
        id: rpcData,
        recipient_id: params.recipientId,
        actor_id: params.actorId,
        org_id: params.orgId,
        type: params.type,
        title: params.title,
        body: params.body,
        link: params.link,
        source_type: params.sourceType,
        source_id: params.sourceId,
        is_read: false,
        created_at: new Date().toISOString(),
      };
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

  try {
    // 1. Try secure bulk RPC function
    const { data: rpcCount, error: rpcErr } = await client.rpc('create_bulk_notifications', {
      p_recipient_ids: uniqueRecipients,
      p_type: params.type,
      p_title: params.title,
      p_body: params.body,
      p_link: params.link || null,
      p_actor_id: params.actorId || null,
      p_org_id: params.orgId || null,
      p_source_type: params.sourceType || null,
      p_source_id: params.sourceId || null,
    });

    if (rpcErr) {
      // 2. Direct INSERT fallback
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

      const { error } = await client.from('notifications').insert(rows);
      if (error) {
        console.warn('[NotificationService] Bulk insert error:', error);
      }
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
