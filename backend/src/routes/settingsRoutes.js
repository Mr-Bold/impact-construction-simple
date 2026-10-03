import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
const defaultSettings = {
	company_name: 'Impact Construction',
	tagline: 'Considered spaces. Precise craft. Dependable delivery.',
	phone: '+233 24 000 0000',
	whatsapp: '233240000000',
	email: 'hello@impactconstruction.co',
	address: 'Accra, Ghana',
	opening_hours: 'Mon-Sat, 8am-6pm',
	description: 'Construction, renovation, and handy-work delivered with discipline.',
	logo_url: '',
};

router.get('/', async (req, res, next) => {
	try {
		const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
		if (error?.code === 'PGRST205' || error?.code === '42P01') {
			return res.json({ success: true, settings: defaultSettings, storageConfigured: false });
		}
		if (error) throw error;
		res.json({ success: true, settings: data, storageConfigured: true });
	} catch (error) {
		next(error);
	}
});
router.put('/', requireAuth, async (req, res, next) => { try { const allowed = ['company_name','tagline','phone','whatsapp','email','address','opening_hours','description','logo_url']; const values = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, String(req.body[key]).trim()])); const { data, error } = await supabase.from('site_settings').upsert({ id: 1, ...values, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; res.json({ success: true, settings: data }); } catch (error) { next(error); } });
router.post('/logo', requireAuth, async (req, res, next) => { try { const { fileName, mimeType, base64 } = req.body; if (!mimeType?.startsWith('image/')) return res.status(400).json({ success: false, message: 'Please upload an image file.' }); const buffer = Buffer.from(base64 || '', 'base64'); if (!buffer.length || buffer.length > 5 * 1024 * 1024) return res.status(400).json({ success: false, message: 'Logo must be smaller than 5MB.' }); const extension = (fileName?.split('.').pop() || 'png').replace(/[^a-z0-9]/gi, '').toLowerCase(); const path = `branding/logo-${Date.now()}.${extension}`; const { error: uploadError } = await supabase.storage.from('company-assets').upload(path, buffer, { contentType: mimeType, upsert: true }); if (uploadError) throw uploadError; const { data: publicFile } = supabase.storage.from('company-assets').getPublicUrl(path); const { data, error } = await supabase.from('site_settings').upsert({ id: 1, logo_url: publicFile.publicUrl, updated_at: new Date().toISOString() }).select().single(); if (error) throw error; res.json({ success: true, settings: data }); } catch (error) { next(error); } });
export default router;