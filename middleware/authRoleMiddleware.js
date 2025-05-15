import logger from '../utils/logger.js'
// 🎯 Middleware d’autorisation par rôle
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.warn(`Unauthorized access by user ${req.user?.id } with role ${req.user?.role || 'none'}`);
      return res.status(403).json({ message: 'Access denied - role not authorized' });
    }
    next();
  };
};

export default authorizeRoles