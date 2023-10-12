var rutapr = require("express").Router();
var {
  mostrarProductos,
  nuevoProducto,
  borrarProducto,
  modificarProducto,
  buscarPorIDPr,
} = require("../database/productosbd");
var subirArchivo = require("../middlewares/subirArchivos");
var fs = require("fs");

rutapr.get("/api/productos/mostrarproductos", async (req, res) => {
  var productos = await mostrarProductos();
  if (productos.length > 0) {
    res.status(200).json(productos);
  } else {
    res.status(400).json("No hay productos");
  }
});

rutapr.post(
  "/api/productos/nuevoproducto",
  subirArchivo(),
  async (req, res) => {
    req.body.foto = req.file.originalname;
    var error = await nuevoProducto(req.body);
    if (error == 0) {
      res.status(200).json("Producto agregado");
    } else {
      res.status(400).json("Error al agregar producto");
    }
  }
);

rutapr.get("/api/productos/buscarProductoPorId/:id", async (req, res) => {
  var product = await buscarPorIDPr(req.params.id);
  if (product == "") {
    res.status(400).json("No se encontro el producto");
  } else {
    res.status(200).json(product);
  }
});

rutapr.post("/api/productos/editarPr", subirArchivo(), async (req, res) => {
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
    if (error == 0) {
      res.status(200).json("Producto modificado");
    } else {
      res.status(400).json("Error al modificar el producto");
    }
  } catch (error) {
    console.error("Error al editar pr:", error);  
    res.status(500).send("Error interno del servidor");
  }
});

rutapr.get("/api/productos/borrarPr/:id", async (req, res) => {
  try {
    var producto=await buscarPorIDPr(req.params.id)
    if(producto){
      var foto= producto.foto;
      fs.unlinkSync(`web/images/${foto}`);
      var error = await borrarProducto(req.params.id);
    }
    if (error == 0) {
      res.status(200).json("Producto borrado");
    } else {
      res.status(400).json("Error al borrar el producto");
    }
  } catch (error) {
    console.error("Error al borrar pr:", error);  
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = rutapr;
