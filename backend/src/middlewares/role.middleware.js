/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * Usage: authorize("ADMIN"), authorize("PROVIDER", "ADMIN")
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied: Required role (${allowedRoles.join(", ")}) not met`
            });
        }

        next();
    };
};

module.exports = authorize;
