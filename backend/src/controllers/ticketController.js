import { query } from '../config/db.js';

export const getTickets = async (req, res) => {
    try {
        let sql = 'SELECT * FROM tickets';
        let params = [];
        
        if (req.user.role === 'USER') {
            sql += ' WHERE user_id = ?';
            params.push(req.user.id);
        } else if (req.user.role === 'IT_ADMIN') {
            sql += " WHERE issue_type = 'IT'";
        }
        
        sql += ' ORDER BY created_at DESC';
        const { rows } = await query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createTicket = async (req, res) => {
    const { title, description, issue_type, priority, floor, department, phone } = req.body;
    try {
        const sql = `
            INSERT INTO tickets (user_id, title, description, issue_type, priority, floor, department, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const { rows } = await query(sql, [
            req.user.id, title, description, issue_type, priority, floor, department, phone
        ]);
        res.status(201).json({ id: rows.insertId, user_id: req.user.id, title, description, issue_type, priority, floor, department, phone });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status, escalated } = req.body;
    
    try {
        if (escalated !== undefined && req.user.role !== 'SUPER_ADMIN') {
             return res.status(403).json({ message: 'Only SUPER_ADMIN can escalate' });
        }

        let sql = 'UPDATE tickets SET status = COALESCE(?, status), escalated = COALESCE(?, escalated) WHERE id = ?';
        const { rows } = await query(sql, [status, escalated, id]);
        
        if (rows.affectedRows === 0) return res.status(404).json({ message: 'Ticket not found' });
        res.json({ message: 'Ticket updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const addComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    
    try {
        const sql = 'INSERT INTO comments (ticket_id, user_id, content) VALUES (?, ?, ?)';
        const { rows } = await query(sql, [id, req.user.id, content]);
        res.status(201).json({ id: rows.insertId, ticket_id: id, user_id: req.user.id, content });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
