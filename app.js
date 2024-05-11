const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

//Configuración de la sessión
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: true
}));

//Configuración de body-parser para analizar solicitudes POST
app.use(bodyParser.urlencoded({ extended: true }));

//Configuración de la conexión a la base de datos MySql
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'node_login'
});

db.connect((err) => {
    if(err) throw err;
    console.log('Conexión a la base de datos MySql establecida');
});

//Resolver las rutas de los archivos statatics
app.use(express.static("public"));

//Defirnir ruta para el formulario de logueo de sesión
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

//Defirnir ruta para el formulario de registro de sesión
app.get('/registro', (req, res) => {
    res.sendFile(__dirname + '/public/registro.html');
});

//Rutas de db
//Puedes implementar rutas para el registro, inicio de sesión, cierre de sesión.
app.post('/registro', async (req, res) => {
    const { nombre, email, contraseña } = req.body;
    const hashedContraseña = await bcrypt.hash(contraseña, 10);

    db.query('INSERT INTO usuarios (nombre_usuario, email, contraseña) VALUES (?, ?, ?)',[nombre, email, hashedContraseña],(err, result)=>{
        if(err) {
            console.log(err);
            res.send('Eror al registrar usuario');
        } else {
            console.log(result);
            res.send('Usuario registrado con éxito!');
        }
    });
});

//Ruta de inicio de sesión
app.post('/login', async (req, res) => {
    const { email, contraseña } = req.body;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, result) => {
        if(err){
            console.log(err);
            res.send('Error al iniciar sesión');
        } else {
            if(result.length > 0) {
                const usuario = result[0];
                if(await bcrypt.compare(contraseña, usuario.contraseña)){
                    req.session.usuario = usuario;
                    res.send('Inicio de sesión exitoso');
                } else {
                    res.send('Credenciales incorrectas');
                }
            } else {
                res.send('Usuario no encontrado');
            }
        }
    });
});

//Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto${PORT}`);
});

