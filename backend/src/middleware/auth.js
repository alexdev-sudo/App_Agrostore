// auth.js - Middleware para verificar autenticación usando JWT
const jwt = require('jsonwebtoken');

// verifica el token JWT: se usa asi en cualquier ruta que requiera autenticacion
const verificarToken = (req, res, next) => {
    // frontend manda el token en el header "Authorization"
    const authHeader = req.headers['authorization'];
    const token  = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN
    if (!token) {
        return res.status(401).json({
            error: 'Necesitas iniciar sesion para acceder'});
    }

    try {
        // jwt.verify lanza error si el token es falso o expiro 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // {id,nombrre, tipo}
        next(); // todo bien , continua a la ruta    
    }catch(err) {
        res.status(403).json({
            error: 'Tu sesion expiro. por favor inicia sesion nuevamente.'
    });
}
};
// verifarRol: se encadena despues de verificartoken 
// uso: router.post('/producto', verificartoken, verificarRol('productor'),handler);
// acepta multiples roles: verificrRol ('productor', 'admin')

const verificarRol = (...roles) => (req,res,next) =>{
    if (!roles.includes(req.user.tipo)) {
        return res.status(403).json({
            Error: `esta funcion es solo para: ${roles.join(' o ')}`
        });
}next();
};
module.exports = {verificarToken, verificarRol};