import { query } from '../config/db.js';

export const listNotifications = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 50, 200);
        const { rows } = await query(
            `SELECT id, type, title, body, ticket_id, is_read, read_at, created_at
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT ?`,
            [req.user.id, limit]
        );
        res.json(rows);
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await query(
            `UPDATE notifications SET is_read = 1, read_at = NOW()
             WHERE id = ? AND user_id = ?`,
            [id, req.user.id]
        );
        if (rows.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Updated' });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        await query(
            `UPDATE notifications SET is_read = 1, read_at = NOW()
             WHERE user_id = ? AND is_read = 0`,
            [req.user.id]
        );
        res.json({ message: 'Updated' });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};
