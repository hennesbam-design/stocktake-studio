import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getItems } from './_storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { groupId } = req.query;
    const items = await getItems(typeof groupId === 'string' ? groupId : undefined);
    res.status(200).json(items);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
