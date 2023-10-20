var rutapr = require("express").Router();
var {
  mostrarProductos,
  nuevoProducto,
  borrarProducto,
  modificarProducto,
  buscarPorIDPr,
} = require("../database/productosbd");
const { admin } = require("../middlewares/funcionesPassword");
var subirArchivo = require("../middlewares/subirArchivos");
var fs=require("fs")

rutapr.get("/productos/mostrarproductos", async (req, res) => {
  var productos = await mostrarProductos();
  res.render("productos/mostrarpr", { productos });
});

rutapr.get("/productos/nuevoproducto", admin, (req, res) => {
  res.render("productos/nuevopr");
});

rutapr.post("/productos/nuevoproducto",subirArchivo(), async (req, res) => {
  req.body.foto=req.file.originalname;
  var error = await nuevoProducto(req.body);
  res.redirect("/productos/productos/mostrarproductos");
});

rutapr.get("/productos/editarPr/:id", async (req, res) => {
  var product = await buscarPorIDPr(req.params.id);
  res.render("productos/modificarPr", { product });
});

rutapr.post("/productos/editarPr",subirArchivo(), async (req, res) => {
  try {
    const productoAct = await buscarPorIDPr(req.body.id);
    if (req.file) {
        req.body.foto = req.file.originalname;
        if (productoAct.foto) {
            const rutaFotoAnterior = `web/images/${productoAct.foto}`;
            fs.unlinkSync(rutaFotoAnterior);
        }
    }
    var error = await modificarProducto(req.body);
    res.redirect("/productos/productos/mostrarproductos");
  } catch (error) {
    console.error("Error al editar pr:", error);  
    res.status(500).send("Error interno del servidor");
  }
  
});




rutapr.get("/productos/borrarPr/:id", async (req, res) => {
  var producto=await buscarPorIDPr(req.params.id)
  if(producto){
  var foto= producto.foto;
  fs.unlinkSync(`web/images/${foto}`);
  await borrarProducto(req.params.id);
  }
  res.redirect("/productos/productos/mostrarproductos");
});

module.exports = rutapr;
