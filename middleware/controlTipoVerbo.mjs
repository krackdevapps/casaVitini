export const controlTipoVerbo = (error, entrada, salida, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    const respuesta = {
      "Casa Vitini": "Entrada de datos universalmente mal formateada, solo se acepta el formato JSON correctamanente formateado"
    }
    salida.status(400).json(respuesta);
  }
}