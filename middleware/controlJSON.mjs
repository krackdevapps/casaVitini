export const controlJSON = (err, entrada, salida, next) => {
  if (entrada.method !== 'POST' && entrada.method !== 'GET') {
    const error = {
      error: "Casa Vitini solo maneja peticiones GET y POST"
    };
    salida.json(error)
  }
}