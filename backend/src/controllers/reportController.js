import { streamMonthlyTicketsPdf } from '../services/reportService.js';

export const getMonthlyPdfReport = async (req, res) => {
    try {
        const year = req.query.year ?? new Date().getFullYear();
        const month = req.query.month ?? new Date().getMonth() + 1;
        await streamMonthlyTicketsPdf(res, year, month);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ message: 'Report generation failed' });
    }
};
