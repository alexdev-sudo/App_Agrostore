// auth.js - rutas de registro e inicio de sesion
const express = require('express');
const router = express.router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // conexion a postgreSQL
const {verificarToken} = require('../middleware/auth'); // middleware para proteger rutas

// POST  /api/auth/registro 
// crea una nueva cuenta de usuario  

router.post('/registro', async (req,res) => {
    const{nombre, telefono,tipo,constrasena, ubicacion} = req.body;

    // validacion: todos los campos obligatorios debe estar presentes
if(!nombre || !telefono || !tipo || !constrasena ) {
    return res.status(400).json({
        error: 'por favor completa todos los campos: nombre , telefono, tipo y constrasena'
    });
}

// solo se permiten estos dos roles al registrarse 
// administrador solo puede ser creado directamente en la DB

if(!['productor','consumidor'].includes(tipo)) {
    return res.status(400).json({ 
        error: 'tipo de usuario no validodebe ser productor o comprador'
    });
}

// bcrypt.hash (texto,rondas) - 10 rondas 
// mas rondas =  mas seguro pero mas lento 
const hash = await bcrypt.hash(contrasena, 10);

try {
    const result = await db.query(
       `INSERT INTO usuario(nombre, telefono,tipo,contrasena,ubicacion)
        VALUES($1,$2,$3,$4,$5) RETURNING id_usuario, nombre, tipo`,
        [nombre, telefono,tipo,hash,ubicacion || null ]
    );

    // nota : postgreSQL usa $1, $2 ... en lugar de ? de mysql
    res.status(201).json({
        mensaje: 'Cuenta creada exitosamente!!',
        usuario: result.rows[0] // {id_usuario, nombre, tipo}
    });
}catch(err) {
    //codigo 23505 en postgreSQL  = violacion de UNIQUE(Telefono duplicado)
    if(err.code === '23505') {
        return res.status(409).json({
            error: 'Numero de telefono ya tiene una cuenta registrada'
        });
    }
    console.error(err);
    res.status(500).json({
        error: 'error al crear la cuenta, por favor intente nuevamente'
    });
}

});

// POST /api/auth/login
//incia sesion y devuelve un token jwt
router.post('/login',async (req,res) => {
const {telefono,contrasena} = req.body;

if (!telefono || !contrasena) {
    return res.status(400).json({
        error: 'Telefono y contrasena son obligatorios'});
}
try{
    const result = await db.query(
        'SELECT * FROM usuario WHERE telefono = $1 AND activo = true',
        [telefono]
    );
    if(result.rows.length === 0 ){
        return res.status(401).json({
            error: 'No encontramos una cuenta con ese numero de telefono'
        });
    }
    const usuario = result.rows[0]; // {id_usuario, nombre, tipo, contrasena: hash}

    //bcrypt.compare COMPARA ;"1234" con el hash guardad en la DB
    //devuelve true si coniciden, false si no
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
        return res.status(401).json({
            error: 'Contrasena Incorrecta'
        });
}
// creamos el token con los datos minimos necesarios
//Nunca incluimos la contresena en el token

const token = jwt.sign(
    {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        tipo: usuario.tipo
    },
    process.env.JWT_SECRET,
    {expiresIn: '7d'} // el token dura 7 dias 
);
res.json({
    token, 
    usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        tipo: usuario.tipo,
        ubicacion: usuario.ubicacion,
        calificacion: usuario.calificacion
    }
});
}catch(err){
    console.error(err);
    res.status(500).json({
        error: 'Error del servicio'
    });
}
});

// GET /api/auth/perfil - datos del usuariologueado
router.get('/perfil', verificarToken, async(req, res) => {
    const result = await db.query(
        `SELECT id_usuario,nombre, telefono, tipo, ubicacion, calificacion
        FROM usuario WHERE id_usuario  = $1`, 
        [req.user.id]  );

        res.json(result.rows[0]);
    });
    module.exports = router