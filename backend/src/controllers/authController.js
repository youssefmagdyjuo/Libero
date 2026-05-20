import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        
        const user = rows[0];
        // In real app, compare hashed password using bcrypt
        if (user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
        
        if (!user.is_active) return res.status(403).json({ message: 'User is disabled' });

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username, avatar: user.avatar || null },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role, avatar: user.avatar || null }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const { rows } = await query('SELECT password FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = rows[0];
        if (user.password !== currentPassword) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        await query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const me = (req, res) => {
    res.json({ user: req.user });
};
