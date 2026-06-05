const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Necesitas iniciar sesión para acceder' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Usar req.usuario en lugar de req.user para mantener consistencia con el resto del código
        req.usuario = decoded;

        // Normalizar roles como array
        if (!Array.isArray(req.usuario.roles)) {
            req.usuario.roles = req.usuario.tipo ? [req.usuario.tipo] : [];
        }

        next();
    } catch (err) {
        return res.status(403).json({
            error: 'Tu sesión expiró. Por favor inicia sesión nuevamente.'
        });
    }
};

const verificarRol = (...roles) => (req, res, next) => {
    const userRoles = Array.isArray(req.usuario.roles) ? req.usuario.roles : [];
    const allowed = roles.some(role => userRoles.includes(role));

    if (!allowed) {
        return res.status(403).json({
            Error: `Esta función es solo para: ${roles.join(' o ')}`
        });
    }
    next();
};

module.exports = { verificarToken, verificarRol };