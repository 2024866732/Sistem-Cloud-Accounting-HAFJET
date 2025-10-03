import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ message: 'Tax endpoint - Coming soon' }));
export default router;