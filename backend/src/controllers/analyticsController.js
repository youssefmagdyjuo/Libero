import { query } from '../config/db.js';

function baseTicketScope(role, userId) {
    if (role === 'USER') return { clause: 'WHERE user_id = ?', params: [userId] };
    if (role === 'IT_ADMIN') return { clause: "WHERE issue_type = 'IT'", params: [] };
    return { clause: '', params: [] };
}

export const getTicketsByStatus = async (req, res) => {
    try {
        const { clause, params } = baseTicketScope(req.user.role, req.user.id);
        const sql = `SELECT status, COUNT(*) AS count FROM tickets ${clause} GROUP BY status ORDER BY status`;
        const { rows } = await query(sql, params);
        res.json(rows);
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTicketsByType = async (req, res) => {
    try {
        const { clause, params } = baseTicketScope(req.user.role, req.user.id);
        const sql = `SELECT issue_type AS type, COUNT(*) AS count FROM tickets ${clause} GROUP BY issue_type ORDER BY issue_type`;
        const { rows } = await query(sql, params);
        res.json(rows);
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAvgResolutionTime = async (req, res) => {
    try {
        const { clause, params } = baseTicketScope(req.user.role, req.user.id);
        const where = clause ? `${clause} AND status = 'Solved'` : `WHERE status = 'Solved'`;
        const sql = `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) AS avg_resolution_hours FROM tickets ${where}`;
        const { rows } = await query(sql, params);
        const v = rows[0]?.avg_resolution_hours;
        res.json({
            avg_resolution_hours: v != null ? Number(v) : null
        });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};
