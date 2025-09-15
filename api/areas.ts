import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAreas } from './_storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { departmentId } = req.query;
    const areas = await getAreas(typeof departmentId === 'string' ? departmentId : undefined);
    res.status(200).json(areas);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
