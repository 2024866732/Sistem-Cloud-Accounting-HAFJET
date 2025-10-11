import express from 'express';

const router = express.Router();

// Minimal purchases routes stub - implement with business logic later
router.get('/', (_req, res) => res.json({ items: [], total: 0 }));
router.get('/:id', (_req, res) => res.status(404).json({ error: 'not implemented' }));

export default router;
