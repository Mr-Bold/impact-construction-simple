const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export function requireAdmin(req, res, next) {
  const email = req.user?.email?.toLowerCase();
  const isAdmin =
    req.user?.app_metadata?.role === 'admin' ||
    req.user?.app_metadata?.admin === true ||
    (email && adminEmails.has(email));

  if (!isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }

  return next();
}