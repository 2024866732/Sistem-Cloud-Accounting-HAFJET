import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ message: 'Inventory endpoint - Coming soon' }));
export default router;