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
            { id: user.id, role: user.role, username: user.username },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const me = (req, res) => {
    res.json({ user: req.user });
};
