var express = require("express");
var cors = require("cors");
var path = require("path");
var rutas = require("./routes/usuariosRutas");
var rutaspr = require("./routes/productosRutas");
var rutasUsuariosApis = require("./routes/usuariosRutasApis");
var rutasProductosApis = require("./routes/productosRutasApi");

var app = express();
app.set("view engine", "ejs");
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "/web")));
app.use("/", rutas);
app.use("/productos", rutaspr);
app.use("/", rutasUsuariosApis);
app.use("/", rutasProductosApis);

var port = process.env.port || 3000;

app.listen(port, () => {
  console.log("Servidor en http://localhost:" + port);
});
