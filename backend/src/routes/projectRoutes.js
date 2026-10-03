import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const allowedMediaTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']);

function parseProjectMedia(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'Each image or video must be 50 MB or smaller.' });
    }
    return res.status(400).json({ success: false, message: error.message || 'Unable to read the uploaded file.' });
  });
}

function makeSlug(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `project-${Date.now()}`;
}

async function getUniqueSlug(title) {
  const baseSlug = makeSlug(title);
  let slug = baseSlug;
  let suffix = 2;
  while (true) {
    const { data, error } = await supabase.from('projects').select('id').eq('slug', slug).maybeSingle();
    if (error) throw error;
    if (!data) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function getInteractionStats(projectId, visitorIdentifier) {
  const [likes, ratings, currentLike, currentRating, reviews] = await Promise.all([
    supabase.from('likes').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
    supabase.from('ratings').select('rating').eq('project_id', projectId),
    supabase.from('likes').select('id').eq('project_id', projectId).eq('visitor_identifier', visitorIdentifier).maybeSingle(),
    supabase.from('ratings').select('rating').eq('project_id', projectId).eq('visitor_identifier', visitorIdentifier).maybeSingle(),
    supabase.from('reviews').select('id,name,rating,review,created_at').eq('project_id', projectId).eq('status', 'approved').order('created_at', { ascending: false })
  ]);
  const failed = [likes, ratings, currentLike, currentRating, reviews].find((result) => result.error);
  if (failed) throw failed.error;
  const ratingValues = ratings.data || [];
  return { likesCount: likes.count || 0, ratingsCount: ratingValues.length, averageRating: ratingValues.length ? Number((ratingValues.reduce((sum, item) => sum + item.rating, 0) / ratingValues.length).toFixed(1)) : 0, liked: Boolean(currentLike.data), selectedRating: currentRating.data?.rating || 0, reviews: reviews.data || [] };
}

router.get('/', async (req, res, next) => { try { let query = supabase.from('projects').select('*, project_media(*)').eq('status','published').order('featured',{ascending:false}).order('created_at',{ascending:false}); if(req.query.category && req.query.category !== 'All') query = query.eq('category', req.query.category); const { data, error } = await query; if(error) throw error; res.json({success:true, projects:data}); } catch(error){ next(error); } });
router.get('/admin', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_media(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, projects: data || [] });
  } catch (error) {
    next(error);
  }
});
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const category = String(req.body.category || '').trim();
    const location = String(req.body.location || '').trim();
    const description = String(req.body.description || '').trim();
    if (!title || !category || !location || !description) {
      return res.status(400).json({ success: false, message: 'Title, category, location, and description are required.' });
    }

    const services = Array.isArray(req.body.services)
      ? req.body.services.map((item) => String(item).trim()).filter(Boolean)
      : String(req.body.services || '').split(',').map((item) => item.trim()).filter(Boolean);
    const project = {
      title,
      slug: await getUniqueSlug(title),
      category,
      location,
      description,
      services,
      project_date: req.body.project_date || null,
      featured: req.body.featured === true || req.body.featured === 'true',
      status: req.body.status === 'draft' ? 'draft' : 'published',
    };
    const { data, error } = await supabase.from('projects').insert(project).select('*, project_media(*)').single();
    if (error) throw error;
    res.status(201).json({ success: true, project: data });
  } catch (error) {
    next(error);
  }
});
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const { data: media, error: mediaError } = await supabase
      .from('project_media')
      .select('media_url, media_type')
      .eq('project_id', project.id);
    if (mediaError) throw mediaError;

    const { data: deletedProject, error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)
      .select('id')
      .maybeSingle();
    if (deleteError) throw deleteError;
    if (!deletedProject) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const storageObjects = new Map([
      ['project-images', new Set()],
      ['project-videos', new Set()],
    ]);
    let unrecognizedMedia = 0;
    for (const item of media || []) {
      const bucket = item.media_type === 'video' ? 'project-videos' : 'project-images';
      try {
        const pathname = new URL(item.media_url).pathname;
        const publicPrefix = `/storage/v1/object/public/${bucket}/`;
        if (!pathname.startsWith(publicPrefix)) {
          unrecognizedMedia += 1;
          continue;
        }
        storageObjects.get(bucket).add(decodeURIComponent(pathname.slice(publicPrefix.length)));
      } catch {
        unrecognizedMedia += 1;
      }
    }

    const cleanupFailures = [];
    for (const [bucket, paths] of storageObjects) {
      if (!paths.size) continue;
      const { error } = await supabase.storage.from(bucket).remove([...paths]);
      if (error) {
        console.error(`Unable to remove project media from ${bucket}.`, error);
        cleanupFailures.push(bucket);
      }
    }

    const cleanupWarning =
      cleanupFailures.length || unrecognizedMedia
        ? `Project deleted, but some media files may remain${cleanupFailures.length ? ` in ${cleanupFailures.join(' and ')}` : ''}${unrecognizedMedia ? ` (${unrecognizedMedia} file${unrecognizedMedia === 1 ? '' : 's'} had an unrecognized URL)` : ''}.`
        : '';
    res.json({ success: true, message: 'Project deleted.', cleanupWarning });
  } catch (error) {
    next(error);
  }
});
router.post('/:id/media', requireAuth, requireAdmin, parseProjectMedia, async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'Choose an image or video to upload.' });
    if (!allowedMediaTypes.has(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Use JPG, PNG, WEBP, MP4, WEBM, or MOV files.' });
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();
    if (projectError) throw projectError;
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    const bucket = mediaType === 'video' ? 'project-videos' : 'project-images';
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    if (!buckets.some((item) => item.name === bucket)) {
      const { error: createBucketError } = await supabase.storage.createBucket(bucket, { public: true });
      if (createBucketError && !createBucketError.message?.toLowerCase().includes('already exists')) throw createBucketError;
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${project.id}/${randomUUID()}-${safeName}`;
    const { error: storageError } = await supabase.storage.from(bucket).upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
    if (storageError) throw storageError;

    const { data: publicFile } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    const { data: latestMedia, error: orderError } = await supabase
      .from('project_media')
      .select('display_order')
      .eq('project_id', project.id)
      .order('display_order', { ascending: false })
      .limit(1);
    if (orderError) throw orderError;

    const isCover = mediaType === 'image' && (req.body.is_cover === 'true' || (latestMedia || []).length === 0);
    const { data, error } = await supabase
      .from('project_media')
      .insert({
        project_id: project.id,
        media_url: publicFile.publicUrl,
        media_type: mediaType,
        display_order: (latestMedia?.[0]?.display_order ?? -1) + 1,
        is_cover: isCover,
      })
      .select('*')
      .single();
    if (error) {
      await supabase.storage.from(bucket).remove([storagePath]);
      throw error;
    }
    res.status(201).json({ success: true, media: data });
  } catch (error) {
    next(error);
  }
});
router.get('/:id', async (req, res, next) => { try { const { data, error } = await supabase.from('projects').select('*, project_media(*)').eq('slug', req.params.id).eq('status','published').single(); if(error) throw error; const stats = await getInteractionStats(data.id, req.query.visitorIdentifier || req.ip); res.json({ success: true, project: { ...data, ...stats } }); } catch(error){ next(error); } });
router.post('/:id/like', async (req, res, next) => { try { const { data: project, error: projectError } = await supabase.from('projects').select('id').eq('slug', req.params.id).single(); if(projectError) throw projectError; const visitorIdentifier = req.body.visitorIdentifier || req.ip; const { data: existing, error: findError } = await supabase.from('likes').select('id').eq('project_id', project.id).eq('visitor_identifier', visitorIdentifier).maybeSingle(); if(findError) throw findError; if(existing) { const { error } = await supabase.from('likes').delete().eq('id', existing.id); if(error) throw error; } else { const { error } = await supabase.from('likes').insert({ project_id: project.id, visitor_identifier: visitorIdentifier }); if(error) throw error; } const stats = await getInteractionStats(project.id, visitorIdentifier); res.json({ success: true, ...stats }); } catch(error){ next(error); } });
router.post('/:id/rating', async (req, res, next) => { try { const { data: project, error: projectError } = await supabase.from('projects').select('id').eq('slug', req.params.id).single(); if(projectError) throw projectError; const rating = Number(req.body.rating); if(!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({success:false,message:'Rating must be between 1 and 5.'}); const visitorIdentifier = req.body.visitorIdentifier || req.ip; const { data: existing, error: findError } = await supabase.from('ratings').select('id,rating').eq('project_id', project.id).eq('visitor_identifier', visitorIdentifier).maybeSingle(); if(findError) throw findError; if(existing?.rating === rating) { const { error } = await supabase.from('ratings').delete().eq('id', existing.id); if(error) throw error; } else { const { error } = await supabase.from('ratings').upsert({ project_id: project.id, visitor_identifier: visitorIdentifier, rating }, { onConflict:'project_id,visitor_identifier' }); if(error) throw error; } const stats = await getInteractionStats(project.id, visitorIdentifier); res.json({success:true,...stats}); } catch(error){ next(error); } });
router.post('/:id/reviews', async (req,res,next) => { try { const { data: project, error: projectError } = await supabase.from('projects').select('id').eq('slug',req.params.id).single(); if(projectError) throw projectError; const { name, rating, review } = req.body; if(!name || !review || !Number.isInteger(Number(rating)) || Number(rating)<1 || Number(rating)>5) return res.status(400).json({success:false,message:'Name, rating, and a 1-5 star review are required.'}); const { error } = await supabase.from('reviews').insert({ project_id:project.id, name:name.trim(), rating:Number(rating), review:review.trim(), status:'pending' }); if(error) throw error; res.status(201).json({success:true,message:'Review submitted for approval.'}); } catch(error){ next(error); } });
export default router;
