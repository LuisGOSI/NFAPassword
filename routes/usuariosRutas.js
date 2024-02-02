var ruta = require("express").Router();
var fs = require("fs");
var {
  mostrarUsuarios,
  nuevoUsuario,
  buscarPorID,
  modificarUsuario,
  borrarUsuario,
  buscarPorUsuario,
  verificarPassword,
} = require("../database/usuariosbd");
var subirArchivo = require("../middlewares/subirArchivos");
var { autorizado , admin } = require("../middlewares/funcionesPassword");

ruta.get("/usuarios", async (req, res) => {
    var usuarios = await mostrarUsuarios();
    res.render("usuarios/mostrar", { usuarios });
});

ruta.get("/nuevousuario", (req, res) => {
  res.render("usuarios/nuevo");
});

ruta.post("/nuevousuario", subirArchivo(), async (req, res) => {
  req.body.foto = req.file.originalname;
  var error = await nuevoUsuario(req.body);
  res.redirect("/");
});

ruta.get("/editar/:id", async (req, res) => {
  var user = await buscarPorID(req.params.id);
  res.render("usuarios/modificar", { user });
});

ruta.post("/editar", subirArchivo(), async (req, res) => {
  try {
    const usuarioAct = await buscarPorID(req.body.id);
    if (req.file) {
      req.body.foto = req.file.originalname;
      if (usuarioAct.foto) {
        const rutaFotoAnterior = `web/images/${usuarioAct.foto}`;
        fs.unlinkSync(rutaFotoAnterior);
      }
    } else {
      req.body.foto = req.body.fotoVieja;   
    }
    await modificarUsuario(req.body);
    res.redirect("/");
  } catch (error) {
    console.error("Error al editar pr:", error);
    res.status(500).send("Error interno del servidor");
  }
});

ruta.get("/borrar/:id", async (req, res) => {
  var usuario = await buscarPorID(req.params.id)
  if (usuario) {
    var foto = usuario.foto;
    fs.unlinkSync(`web/images/${foto}`);
    await borrarUsuario(req.params.id);
  }
  res.redirect("/");
});

ruta.get("/", (req, res) => {
  res.render("usuarios/login");
});

ruta.post("/login", async (req, res) => {
  var { usuario, password } = req.body;
  var usuarioEncontrado = await buscarPorUsuario(usuario);
  if (usuarioEncontrado) {
    var passwordCorrecto = await verificarPassword(password, usuarioEncontrado.password, usuarioEncontrado.salt);
    if (passwordCorrecto) {
      if(usuarioEncontrado.admin){
        req.session.admin = usuarioEncontrado.admin;
        res.redirect("/productos/productos/nuevoproducto");
      }else{
        req.session.usuario = usuarioEncontrado.usuario;  
        res.redirect("/usuarios");
      }
    } else {
      console.log("Usuario o contraseña incorrectos");
      res.render("usuarios/login");
    }
  } else {
    console.log("Usuario o contraseña incorrectos"); 
    res.render("usuarios/login");
  }
});

ruta.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

module.exports = ruta;
