import { query } from '../config/db.js';
import { getIO } from '../socket.js';

export const NOTIFICATION_TYPES = {
    TICKET_STATUS: 'TICKET_STATUS',
    TICKET_COMMENT: 'TICKET_COMMENT'
};

export async function createNotification({ userId, type, title, body, ticketId }) {
    const { rows } = await query(
        `INSERT INTO notifications (user_id, type, title, body, ticket_id) VALUES (?, ?, ?, ?, ?)`,
        [userId, type, title, body ?? null, ticketId ?? null]
    );
    const id = rows.insertId;
    const io = getIO();
    const payload = {
        id,
        type,
        title,
        body: body ?? null,
        ticket_id: ticketId ?? null,
        is_read: false,
        created_at: new Date().toISOString()
    };
    if (io) io.to(`user:${userId}`).emit('notification:new', payload);
    return id;
}

async function getAdminUserIds() {
    const { rows } = await query(
        `SELECT id FROM users WHERE role IN ('SUPER_ADMIN', 'IT_ADMIN') AND is_active = 1`
    );
    return rows.map((r) => r.id);
}

export async function notifyTicketStatusChange({ ticket, oldStatus, newStatus, actorId }) {
    const title = 'Ticket status updated';
    const body = `${ticket.ticket_key}: ${oldStatus} → ${newStatus}`;
    const recipients = new Set();

    if (ticket.user_id && ticket.user_id !== actorId) recipients.add(ticket.user_id);

    const admins = await getAdminUserIds();
    for (const id of admins) {
        if (id !== actorId) recipients.add(id);
    }

    for (const userId of recipients) {
        await createNotification({
            userId,
            type: NOTIFICATION_TYPES.TICKET_STATUS,
            title,
            body,
            ticketId: ticket.id
        });
    }
}

export async function notifyNewTicketComment({ ticket, actorId, preview }) {
    const title = 'New ticket comment';
    const body = `${ticket.ticket_key}: ${preview}`;
    const recipients = new Set();

    if (ticket.user_id) recipients.add(ticket.user_id);
    const admins = await getAdminUserIds();
    for (const id of admins) recipients.add(id);

    for (const userId of recipients) {
        if (userId === actorId) continue;
        await createNotification({
            userId,
            type: NOTIFICATION_TYPES.TICKET_COMMENT,
            title,
            body,
            ticketId: ticket.id
        });
    }
}
