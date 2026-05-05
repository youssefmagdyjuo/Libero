import { query } from '../config/db.js';

export const ACTION_TYPES = {
    TICKET_STATUS_CHANGE: 'TICKET_STATUS_CHANGE',
    TICKET_PRIORITY_CHANGE: 'TICKET_PRIORITY_CHANGE',
    TICKET_COMMENT_ADDED: 'TICKET_COMMENT_ADDED'
};

export async function logAudit({ actorId, actionType, entityType, entityId, oldValue, newValue }) {
    await query(
        `INSERT INTO audit_logs (actor_id, action_type, entity_type, entity_id, old_value, new_value)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            actorId,
            actionType,
            entityType,
            entityId,
            oldValue != null ? String(oldValue) : null,
            newValue != null ? String(newValue) : null
        ]
    );
}
