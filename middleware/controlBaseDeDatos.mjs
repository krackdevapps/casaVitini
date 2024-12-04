import { estadoDeAcceso } from '../src/infraestructure/repository/globales/estadoDeAcceso.mjs';

export const controlBaseDeDatos = async (entrada, salida, next) => {
  try {
    await estadoDeAcceso();
    next()
  } catch (errorCapturado) {
    if (entrada.method === 'GET') {
      salida.render('constructorV1', { 'vistaGlobal': '../global/navegacion.ejs' });
    } else if (entrada.method === 'POST') {
      const error = {
        codigo: 'mantenimiento',
        error: 'Estamos en modo mantenimiento. Ahora mismo, el procesador de peticiones no acepta peticiones. En breve se reanudará el sistema. Disculpe las molestias.'
      };
      salida.json(error);
    }
  }
}
