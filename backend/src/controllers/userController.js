import { query } from '../config/db.js';

export const getUsers = async (req, res) => {
    try {
        const { rows } = await query('SELECT id, username, role, is_active, created_at FROM users ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createUser = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        // Check if user exists
        const { rows: existing } = await query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const result = await query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, password, role || 'USER']
        );
        
        res.status(201).json({ message: 'User created successfully', id: result.rows.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        await query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);
        res.json({ message: 'User status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, role, password } = req.body;
    try {
        let sql = 'UPDATE users SET username = ?, role = ?';
        let params = [username, role];

        if (password) {
            sql += ', password = ?';
            params.push(password);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        await query(sql, params);
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Prevent deleting yourself or the main admin if possible
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ message: 'You cannot delete yourself' });
        }
        
        await query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
