import { getDepartments } from './_storage.js';
export default async function handler(req, res) {
    if (req.method === 'GET') {
        const departments = await getDepartments();
        res.status(200).json(departments);
    }
    else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
