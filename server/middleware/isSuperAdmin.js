export const isSuperAdmin = (req, res, next) => {
  if (req.user.email === 'codedjade003@gmail.com') {
    return next();
  }
  return res.status(403).json({ message: 'Superadmin access required' });
};