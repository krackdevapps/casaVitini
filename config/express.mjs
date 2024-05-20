

const puerto = process.env.PORT_HTTP
const puertoSec = process.env.PORT_HTTPS
const entorno = process.env.ENTORNO_DB
const infoEntornoDB = () => {
  console.info("Entorno DB:", entorno)
}
const info = () => {
  console.info("Casa Vitini dice Hola!")
}
app.listen(puerto, (entrada, Salida) => {
  console.info(">> Puerto inseguro activo:", puerto)
  info()
})
const llave = process.env.CERTIFICADOS_KEY
const cert = process.env.CERTIFICADOS_CERT
const options = {
  key: fs.readFileSync(llave),
  cert: fs.readFileSync(cert),
};
const servidorHTTPS = https.createServer(options, app).listen(puertoSec, (entrada, salida) => {
  console.info(">> Puerto seguro activo", puertoSec)
  infoEntornoDB();
  info()
});

fs.watchFile(llave, (curr, prev) => {
  console.info('Los certificados han cambiado. Recargando...');
  const newOptions = {
    key: fs.readFileSync(llave),
    cert: fs.readFileSync(cert),
  };
  servidorHTTPS.setSecureContext(newOptions);
  console.info('Servidor HTTPS actualizado');
});
