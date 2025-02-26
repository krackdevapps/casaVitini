export const manejador404 = (entrada, salida) => {
  const URL = entrada.url;
  const Respuesta = {
    casaVitini: "Error 404",
    Info: "Por favor, revisa la dirección introducida porque no existe.",
    URL: URL
  }
  salida.status(404).json(Respuesta);
}