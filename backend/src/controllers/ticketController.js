import { query } from '../config/db.js';

export const getTickets = async (req, res) => {
    try {
        let sql = 'SELECT *, (TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 20) as is_locked FROM tickets';
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

export const getTicketById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT *, (TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 20) as is_locked FROM tickets WHERE id = ?';
        const { rows } = await query(sql, [id]);
        
        if (rows.length === 0) return res.status(404).json({ message: 'Ticket not found' });
        
        const ticket = rows[0];
        const isAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'IT_ADMIN';

        // Fetch attachments
        const { rows: attachments } = await query('SELECT * FROM attachments WHERE ticket_id = ?', [id]);
        ticket.attachments = attachments;

        // Check ownership
        if (ticket.user_id !== req.user.id && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createTicket = async (req, res) => {
    const { title, description, issue_type, priority, floor, department, phone } = req.body;
    try {
        const ticketKey = `TIC-${Date.now()}`;
        
        const sql = `
            INSERT INTO tickets (ticket_key, user_id, title, description, issue_type, priority, floor, department, phone, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const { rows } = await query(sql, [
            ticketKey, req.user.id, title, description, issue_type, priority || 'Medium', floor, department, phone, 'Pending'
        ]);
        
        const ticketId = rows.insertId;

        // Handle file uploads
        if (req.files) {
            if (req.files.image) {
                await query('INSERT INTO attachments (ticket_id, file_path, file_type) VALUES (?, ?, ?)', 
                    [ticketId, req.files.image[0].path, 'image']);
            }
            if (req.files.voice) {
                await query('INSERT INTO attachments (ticket_id, file_path, file_type) VALUES (?, ?, ?)', 
                    [ticketId, req.files.voice[0].path, 'voice']);
            }
        }
        
        res.status(201).json({ 
            id: ticketId, 
            ticket_key: ticketKey,
            user_id: req.user.id, 
            title, 
            description, 
            issue_type, 
            priority: priority || 'Medium', 
            floor, 
            department, 
            phone,
            status: 'Pending'
        });
    } catch (err) {
        console.error('Create ticket error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
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

export const updateTicket = async (req, res) => {
    const { id } = req.params;
    const { title, description, issue_type, floor, department, phone, priority, status } = req.body;
    
    try {
        const { rows } = await query('SELECT *, (TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 20) as is_locked FROM tickets WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Ticket not found' });
        
        const ticket = rows[0];
        const isAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'IT_ADMIN';
        
        if (ticket.user_id !== req.user.id && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: You do not own this ticket' });
        }

        // Strict Enforcement: If not Admin, must be Pending AND within 20 mins
        if (!isAdmin) {
            if (ticket.is_locked) {
                return res.status(403).json({ message: 'You cannot edit this issue because the allowed time (20 min) has passed.' });
            }
            if (ticket.status !== 'Pending') {
                return res.status(403).json({ message: 'You cannot edit this issue because it is no longer Pending.' });
            }
        }

        const newPriority = isAdmin ? (priority || ticket.priority) : ticket.priority;
        const newStatus = isAdmin ? (status || ticket.status) : ticket.status;

        const sql = `
            UPDATE tickets 
            SET title = ?, description = ?, issue_type = ?, floor = ?, department = ?, phone = ?, priority = ?, status = ?
            WHERE id = ?
        `;
        await query(sql, [
            title || ticket.title, description || ticket.description, issue_type || ticket.issue_type, 
            floor || ticket.floor, department || ticket.department, phone || ticket.phone, 
            newPriority, newStatus, id
        ]);
        
        res.json({ message: 'Ticket updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteTicket = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await query('SELECT user_id, status FROM tickets WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Ticket not found' });

        const ticket = rows[0];
        const isAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'IT_ADMIN';

        // Admin can delete anything
        if (!isAdmin) {
            // User can only delete their own ticket
            if (ticket.user_id !== req.user.id) {
                return res.status(403).json({ message: 'Forbidden: You do not own this ticket' });
            }
            // User can only delete if status is Pending
            if (ticket.status !== 'Pending') {
                return res.status(403).json({ message: 'Cannot delete: Ticket is no longer Pending' });
            }
        }

        await query('DELETE FROM tickets WHERE id = ?', [id]);
        res.json({ message: 'Ticket deleted successfully' });
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
