import express from 'express';
import SalesService from '../services/SalesService.js';

const router = express.Router();

// List sales for a company (expects ?companyId=...)
router.get('/', async (req, res, next) => {
  try {
    const companyId = String(req.query.companyId || req.body.companyId || req.headers['x-company-id']);
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '25'), 10);
    if (!companyId) return res.status(400).json({ error: 'companyId required' });
    const result = await SalesService.list(companyId, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const item = await SalesService.getById(id);
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const doc = req.body;
    const created = await SalesService.create(doc);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const patch = req.body;
    const updated = await SalesService.update(id, patch);
    if (!updated) return res.status(404).json({ error: 'not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    await SalesService.remove(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
