import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();
const requestStatuses = new Set(['new', 'contacted', 'quotation', 'approved', 'in_progress', 'completed', 'cancelled']);
const reviewStatuses = new Set(['pending', 'approved', 'rejected']);

router.use(requireAuth, requireAdmin);

router.get('/requests', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*, project:projects(title, slug)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, requests: data || [] });
  } catch (error) {
    next(error);
  }
});

router.patch('/requests/:id', async (req, res, next) => {
  try {
    const status = req.body?.status;
    if (!requestStatuses.has(status)) {
      return res.status(400).json({ success: false, message: 'Choose a valid request status.' });
    }

    const { data, error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Request not found.' });
    res.json({ success: true, request: data });
  } catch (error) {
    next(error);
  }
});

router.get('/reviews', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, project:projects(title, slug)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, reviews: data || [] });
  } catch (error) {
    next(error);
  }
});

router.patch('/reviews/:id', async (req, res, next) => {
  try {
    const status = req.body?.status;
    if (!reviewStatuses.has(status)) {
      return res.status(400).json({ success: false, message: 'Choose a valid review status.' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, review: data });
  } catch (error) {
    next(error);
  }
});

export default router;
