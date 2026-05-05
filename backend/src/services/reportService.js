import PDFDocument from 'pdfkit';
import { query } from '../config/db.js';

export async function streamMonthlyTicketsPdf(res, year, month) {
    const y = Number(year);
    const m = Number(month);
    if (!y || !m || m < 1 || m > 12) {
        res.status(400).json({ message: 'Invalid year or month' });
        return;
    }

    const { rows: statusRows } = await query(
        `SELECT status, COUNT(*) AS cnt FROM tickets
         WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
         GROUP BY status`,
        [y, m]
    );

    const { rows: totalRow } = await query(
        `SELECT COUNT(*) AS total FROM tickets
         WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?`,
        [y, m]
    );
    const total = totalRow[0]?.total ?? 0;

    const { rows: openClosed } = await query(
        `SELECT
            SUM(CASE WHEN status IN ('Pending', 'In Progress') THEN 1 ELSE 0 END) AS open_cnt,
            SUM(CASE WHEN status IN ('Solved', 'Cancelled') THEN 1 ELSE 0 END) AS closed_cnt
         FROM tickets
         WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?`,
        [y, m]
    );

    const { rows: perf } = await query(
        `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) AS avg_hours
         FROM tickets
         WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
           AND status = 'Solved'`,
        [y, m]
    );
    const avgHours = perf[0]?.avg_hours != null ? Number(perf[0].avg_hours).toFixed(2) : null;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="tickets-report-${y}-${String(m).padStart(2, '0')}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(18).text('Hospital ticketing — monthly summary', { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(`Period: ${y}-${String(m).padStart(2, '0')}`);
    doc.moveDown();

    doc.fontSize(12).text('Overview', { underline: true });
    doc.fontSize(11);
    doc.text(`Total tickets created: ${total}`);
    doc.text(`Open (Pending + In Progress): ${openClosed[0]?.open_cnt ?? 0}`);
    doc.text(`Closed (Solved + Cancelled): ${openClosed[0]?.closed_cnt ?? 0}`);
    doc.moveDown();

    doc.fontSize(12).text('By status', { underline: true });
    doc.fontSize(11);
    for (const row of statusRows) {
        doc.text(`${row.status}: ${row.cnt}`);
    }
    doc.moveDown();

    doc.fontSize(12).text('Performance', { underline: true });
    doc.fontSize(11);
    doc.text(
        avgHours != null
            ? `Average resolution time (Solved): ${avgHours} hours (created in this month)`
            : 'Average resolution time: n/a (no solved tickets in period)'
    );

    doc.end();
}
