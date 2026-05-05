import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    io.use((socket, next) => {
        try {
            const rawToken =
                socket.handshake.auth?.token ||
                socket.handshake.query?.token;
            if (!rawToken) return next(new Error('Unauthorized'));
            const token = String(rawToken).startsWith('Bearer ')
                ? String(rawToken).slice(7)
                : String(rawToken);
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            socket.user = decoded;
            next();
        } catch {
            next(new Error('Unauthorized'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(`user:${socket.user.id}`);

        socket.on('ticket:join', ({ ticketId }) => {
            if (ticketId != null) socket.join(`ticket:${ticketId}`);
        });

        socket.on('ticket:leave', ({ ticketId }) => {
            if (ticketId != null) socket.leave(`ticket:${ticketId}`);
        });
    });

    return io;
}

export function getIO() {
    return io;
}

export function emitTicketComment(ticketId, payload) {
    if (io) io.to(`ticket:${ticketId}`).emit('ticket:comment', payload);
}

export function emitTicketCommentUpdated(ticketId, payload) {
    if (io) io.to(`ticket:${ticketId}`).emit('ticket:comment:updated', payload);
}

export function emitTicketCommentDeleted(ticketId, payload) {
    if (io) io.to(`ticket:${ticketId}`).emit('ticket:comment:deleted', payload);
}
