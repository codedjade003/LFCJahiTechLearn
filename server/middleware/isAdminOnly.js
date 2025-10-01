export const isAdminOnly = (req, res, next) => {
  const isOriginalAdmin = req.user.id.toString() === process.env.ADMIN_ID;
  const isAdminOnly = req.user.role === "admin-only";

  if (isOriginalAdmin || isAdminOnly) {
    return next();
  }

  return res.status(403).json({ message: "Admin-only access required" });
};
