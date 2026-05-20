import { query } from '../config/db.js';
import { logAudit, ACTION_TYPES } from '../services/auditService.js';
import {
    notifyTicketStatusChange,
    notifyNewTicketComment
} from '../services/notificationService.js';
import {
    emitTicketComment,
    emitTicketCommentUpdated,
    emitTicketCommentDeleted
} from '../socket.js';
import ExcelJS from 'exceljs';

function buildTicketFilters({ user, query, userJoinAlias = null }) {
    const { status, priority, department, dateFrom, dateTo, issue_type, creator_role, q } = query;

    const joins = [];
    const conditions = [];
    const params = [];

    if (user.role === 'USER') {
        conditions.push('t.user_id = ?');
        params.push(user.id);
    } else if (user.role === 'IT_ADMIN') {
        conditions.push("t.issue_type = 'IT'");
    }

    const rolesAllowed = ['USER', 'IT_ADMIN', 'SUPER_ADMIN'];
    if (
        creator_role &&
        (user.role === 'SUPER_ADMIN' || user.role === 'IT_ADMIN') &&
        rolesAllowed.includes(String(creator_role))
    ) {
        if (!userJoinAlias) {
            joins.push(' INNER JOIN users cu ON cu.id = t.user_id ');
            conditions.push('cu.role = ?');
        } else {
            conditions.push(`${userJoinAlias}.role = ?`);
        }
        params.push(String(creator_role));
    }

    if (status) {
        conditions.push('t.status = ?');
        params.push(status);
    }
    if (priority) {
        conditions.push('t.priority = ?');
        params.push(priority);
    }
    if (department) {
        conditions.push('t.department = ?');
        params.push(department);
    }
    if (dateFrom) {
        conditions.push('DATE(t.created_at) >= ?');
        params.push(dateFrom);
    }
    if (dateTo) {
        conditions.push('DATE(t.created_at) <= ?');
        params.push(dateTo);
    }
    if (issue_type && user.role === 'SUPER_ADMIN') {
        conditions.push('t.issue_type = ?');
        params.push(issue_type);
    }

    if (q) {
        const term = `%${String(q).trim()}%`;
        conditions.push('(t.title LIKE ? OR t.ticket_key LIKE ? OR t.issue_type LIKE ?)');
        params.push(term, term, term);
    }

    return { joins: joins.join(''), conditions, params };
}

async function fetchTicketById(id) {
    const { rows } = await query('SELECT * FROM tickets WHERE id = ?', [id]);
    return rows[0] || null;
}

function canAccessTicket(req, ticket) {
    if (!ticket) return false;
    const uid = Number(req.user.id);
    const ownerId = Number(ticket.user_id);
    if (ownerId === uid) return true;
    const isAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'IT_ADMIN';
    if (!isAdmin) return false;
    if (req.user.role === 'IT_ADMIN' && ticket.issue_type !== 'IT') return false;
    return true;
}

export const getTickets = async (req, res) => {
    try {
        const { joins, conditions, params } = buildTicketFilters({
            user: req.user,
            query: req.query,
            userJoinAlias: null
        });

        let sql = `SELECT t.*, (TIMESTAMPDIFF(MINUTE, t.created_at, NOW()) > 20) as is_locked FROM tickets t ${joins}`;
        if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
        sql += ' ORDER BY t.created_at DESC';

        const { rows } = await query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const exportTickets = async (req, res) => {
    try {
        const { joins, conditions, params } = buildTicketFilters({
            user: req.user,
            query: req.query,
            userJoinAlias: 'u'
        });

        // Always join creator user for export output + creator_role filtering
        const userJoinSql = ' INNER JOIN users u ON u.id = t.user_id ';

        let sql = `
            SELECT
                t.id,
                t.ticket_key,
                t.title,
                t.description,
                t.status,
                t.issue_type,
                t.department,
                u.username AS created_by,
                t.created_at
            FROM tickets t
            ${userJoinSql}
            ${joins}
        `;
        if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
        sql += ' ORDER BY t.created_at DESC';

        const { rows } = await query(sql, params);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Hospital Ticketing System';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Tickets');
        sheet.columns = [
            { header: 'Ticket ID', key: 'ticket_key', width: 14 },
            { header: 'Title', key: 'title', width: 28 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'Status', key: 'status', width: 14 },
            { header: 'Type', key: 'issue_type', width: 12 },
            { header: 'Department', key: 'department', width: 18 },
            { header: 'Created By', key: 'created_by', width: 18 },
            { header: 'Created At', key: 'created_at', width: 20 }
        ];

        sheet.getRow(1).font = { bold: true };
        sheet.views = [{ state: 'frozen', ySplit: 1 }];

        for (const r of rows) {
            sheet.addRow({
                ticket_key: r.ticket_key,
                title: r.title,
                description: r.description,
                status: r.status,
                issue_type: r.issue_type,
                department: r.department,
                created_by: r.created_by,
                created_at: r.created_at ? new Date(r.created_at) : null
            });
        }

        // Date formatting
        const createdAtCol = sheet.getColumn('created_at');
        createdAtCol.numFmt = 'yyyy-mm-dd hh:mm';

        // Auto-adjust widths (within a safe max)
        sheet.columns.forEach((col) => {
            let max = col.width || 10;
            col.eachCell({ includeEmpty: true }, (cell) => {
                const v = cell.value;
                const text =
                    v == null
                        ? ''
                        : v instanceof Date
                          ? v.toISOString()
                          : typeof v === 'object' && v.text
                            ? String(v.text)
                            : String(v);
                max = Math.max(max, Math.min(60, text.length + 2));
            });
            col.width = max;
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename="tickets.xlsx"');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTicketComments = async (req, res) => {
    const { id } = req.params;
    try {
        const ticket = await fetchTicketById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (!canAccessTicket(req, ticket)) return res.status(403).json({ message: 'Forbidden' });

        const ticketId = Number(id);
        const combined = [];

        try {
            const { rows: fromNew } = await query(
                `SELECT tc.id, tc.ticket_id, tc.user_id, u.username, u.avatar, tc.content, tc.created_at
                 FROM ticket_comments tc
                 INNER JOIN users u ON u.id = tc.user_id
                 WHERE tc.ticket_id = ?
                 ORDER BY tc.created_at ASC`,
                [ticketId]
            );
            combined.push(...fromNew);
        } catch (e) {
            const missing = e.code === 'ER_NO_SUCH_TABLE' || e.errno === 1146;
            if (!missing) throw e;
        }

        try {
            const { rows: fromLegacy } = await query(
                `SELECT c.id, c.ticket_id, c.user_id, u.username, u.avatar, c.content, c.created_at
                 FROM comments c
                 INNER JOIN users u ON u.id = c.user_id
                 WHERE c.ticket_id = ?
                 ORDER BY c.created_at ASC`,
                [ticketId]
            );
            combined.push(...fromLegacy);
        } catch (e) {
            const missing = e.code === 'ER_NO_SUCH_TABLE' || e.errno === 1146;
            if (!missing) throw e;
        }

        combined.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        res.json(combined);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getTicketById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql =
            'SELECT *, (TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 20) as is_locked FROM tickets WHERE id = ?';
        const { rows } = await query(sql, [id]);

        if (rows.length === 0) return res.status(404).json({ message: 'Ticket not found' });

        const ticket = rows[0];
        const isAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'IT_ADMIN';

        const { rows: attachments } = await query('SELECT * FROM attachments WHERE ticket_id = ?', [
            id
        ]);
        ticket.attachments = attachments;

        if (Number(ticket.user_id) !== Number(req.user.id) && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.user.role === 'IT_ADMIN' && ticket.issue_type !== 'IT') {
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
            ticketKey,
            req.user.id,
            title,
            description,
            issue_type,
            priority || 'Medium',
            floor,
            department,
            phone,
            'Pending'
        ]);

        const ticketId = rows.insertId;

        if (req.files) {
            if (req.files.image) {
                await query('INSERT INTO attachments (ticket_id, file_path, file_type) VALUES (?, ?, ?)', [
                    ticketId,
                    req.files.image[0].path,
                    'image'
                ]);
            }
            if (req.files.voice) {
                await query('INSERT INTO attachments (ticket_id, file_path, file_type) VALUES (?, ?, ?)', [
                    ticketId,
                    req.files.voice[0].path,
                    'voice'
                ]);
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

        const ticket = await fetchTicketById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (!canAccessTicket(req, ticket)) return res.status(403).json({ message: 'Forbidden' });

        const oldStatus = ticket.status;

        const sql =
            'UPDATE tickets SET status = COALESCE(?, status), escalated = COALESCE(?, escalated) WHERE id = ?';
        const { rows } = await query(sql, [status ?? null, escalated ?? null, id]);

        if (rows.affectedRows === 0) return res.status(404).json({ message: 'Ticket not found' });

        if (status != null && status !== oldStatus) {
            await logAudit({
                actorId: req.user.id,
                actionType: ACTION_TYPES.TICKET_STATUS_CHANGE,
                entityType: 'ticket',
                entityId: Number(id),
                oldValue: oldStatus,
                newValue: status
            });
            await notifyTicketStatusChange({
                ticket,
                oldStatus,
                newStatus: status,
                actorId: req.user.id
            });
        }

        res.json({ message: 'Ticket updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTicket = async (req, res) => {
    const { id } = req.params;
    const { title, description, issue_type, floor, department, phone, priority, status } =
        req.body;

    try {
        const { rows } = await query(
            'SELECT *, (TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 20) as is_locked FROM tickets WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Ticket not found' });

        const ticket = rows[0];
        const isAdmin = req.user.role === 'SUPER_ADMIN' || req.user.role === 'IT_ADMIN';

        if (!canAccessTicket(req, ticket)) {
            return res.status(403).json({ message: 'Forbidden: You do not own this ticket' });
        }

        if (!isAdmin) {
            if (ticket.is_locked) {
                return res.status(403).json({
                    message:
                        'You cannot edit this issue because the allowed time (20 min) has passed.'
                });
            }
            if (ticket.status !== 'Pending') {
                return res.status(403).json({
                    message: 'You cannot edit this issue because it is no longer Pending.'
                });
            }
        }

        const oldStatus = ticket.status;
        const oldPriority = ticket.priority;

        const newPriority = isAdmin ? priority || ticket.priority : ticket.priority;
        const newStatus = isAdmin ? status || ticket.status : ticket.status;

        const sql = `
            UPDATE tickets 
            SET title = ?, description = ?, issue_type = ?, floor = ?, department = ?, phone = ?, priority = ?, status = ?
            WHERE id = ?
        `;
        await query(sql, [
            title || ticket.title,
            description || ticket.description,
            issue_type || ticket.issue_type,
            floor || ticket.floor,
            department || ticket.department,
            phone || ticket.phone,
            newPriority,
            newStatus,
            id
        ]);

        if (newStatus !== oldStatus) {
            await logAudit({
                actorId: req.user.id,
                actionType: ACTION_TYPES.TICKET_STATUS_CHANGE,
                entityType: 'ticket',
                entityId: Number(id),
                oldValue: oldStatus,
                newValue: newStatus
            });
            await notifyTicketStatusChange({
                ticket,
                oldStatus,
                newStatus,
                actorId: req.user.id
            });
        }

        if (newPriority !== oldPriority) {
            await logAudit({
                actorId: req.user.id,
                actionType: ACTION_TYPES.TICKET_PRIORITY_CHANGE,
                entityType: 'ticket',
                entityId: Number(id),
                oldValue: oldPriority,
                newValue: newPriority
            });
        }

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

        if (!isAdmin) {
            if (Number(ticket.user_id) !== Number(req.user.id)) {
                return res.status(403).json({ message: 'Forbidden: You do not own this ticket' });
            }
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
        if (!content || !String(content).trim()) {
            return res.status(400).json({ message: 'Content required' });
        }

        const ticket = await fetchTicketById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (!canAccessTicket(req, ticket)) return res.status(403).json({ message: 'Forbidden' });

        const text = String(content).trim();

        let insertMeta;
        try {
            insertMeta = await query(
                'INSERT INTO ticket_comments (ticket_id, user_id, content) VALUES (?, ?, ?)',
                [id, req.user.id, text]
            );
        } catch (e) {
            const noTicketComments =
                e.code === 'ER_NO_SUCH_TABLE' || e.errno === 1146;
            if (!noTicketComments) throw e;
            insertMeta = await query(
                'INSERT INTO comments (ticket_id, user_id, content) VALUES (?, ?, ?)',
                [id, req.user.id, text]
            );
        }

        const insertId = insertMeta.rows.insertId;

        try {
            await logAudit({
                actorId: req.user.id,
                actionType: ACTION_TYPES.TICKET_COMMENT_ADDED,
                entityType: 'ticket',
                entityId: Number(id),
                oldValue: null,
                newValue: text.slice(0, 500)
            });
        } catch (e) {
            console.warn('audit log skipped:', e.message);
        }

        const preview = text.slice(0, 140);
        try {
            await notifyNewTicketComment({ ticket, actorId: req.user.id, preview });
        } catch (e) {
            console.warn('notification skipped:', e.message);
        }

        let username = req.user.username;
        let avatar = req.user.avatar;
        if (!username) {
            const { rows: urows } = await query('SELECT username, avatar FROM users WHERE id = ?', [
                req.user.id
            ]);
            username = urows[0]?.username;
            avatar = urows[0]?.avatar;
        }

        const payload = {
            id: insertId,
            ticket_id: Number(id),
            user_id: req.user.id,
            username,
            avatar,
            content: text,
            created_at: new Date().toISOString()
        };

        emitTicketComment(id, payload);

        res.status(201).json(payload);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

async function resolveComment(ticketId, commentId) {
    const tid = Number(ticketId);
    const cid = Number(commentId);
    try {
        const { rows } = await query(
            'SELECT id, ticket_id, user_id, content, created_at FROM ticket_comments WHERE id = ? AND ticket_id = ?',
            [cid, tid]
        );
        if (rows.length) return { row: rows[0], table: 'ticket_comments' };
    } catch (e) {
        const missing = e.code === 'ER_NO_SUCH_TABLE' || e.errno === 1146;
        if (!missing) throw e;
    }
    const { rows } = await query(
        'SELECT id, ticket_id, user_id, content, created_at FROM comments WHERE id = ? AND ticket_id = ?',
        [cid, tid]
    );
    if (rows.length) return { row: rows[0], table: 'comments' };
    return null;
}

function within24Hours(createdAt) {
    return Date.now() - new Date(createdAt).getTime() <= 24 * 60 * 60 * 1000;
}

export const updateTicketComment = async (req, res) => {
    const { id, commentId } = req.params;
    const { content } = req.body;
    try {
        if (!content || !String(content).trim()) {
            return res.status(400).json({ message: 'Content required' });
        }

        const ticket = await fetchTicketById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (!canAccessTicket(req, ticket)) return res.status(403).json({ message: 'Forbidden' });

        const resolved = await resolveComment(id, commentId);
        if (!resolved) return res.status(404).json({ message: 'Comment not found' });

        const { row, table } = resolved;
        if (Number(row.user_id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (!within24Hours(row.created_at)) {
            return res.status(403).json({ message: 'Cannot edit after 24 hours' });
        }

        const text = String(content).trim();
        await query(`UPDATE ${table} SET content = ? WHERE id = ?`, [text, row.id]);

        const payload = {
            id: row.id,
            ticket_id: Number(id),
            user_id: row.user_id,
            content: text
        };
        emitTicketCommentUpdated(id, payload);
        res.json(payload);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteTicketComment = async (req, res) => {
    const { id, commentId } = req.params;
    try {
        const ticket = await fetchTicketById(id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (!canAccessTicket(req, ticket)) return res.status(403).json({ message: 'Forbidden' });

        const resolved = await resolveComment(id, commentId);
        if (!resolved) return res.status(404).json({ message: 'Comment not found' });

        const { row, table } = resolved;
        if (Number(row.user_id) !== Number(req.user.id)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (!within24Hours(row.created_at)) {
            return res.status(403).json({ message: 'Cannot delete after 24 hours' });
        }

        await query(`DELETE FROM ${table} WHERE id = ?`, [row.id]);
        emitTicketCommentDeleted(id, { id: row.id, ticket_id: Number(id) });
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
