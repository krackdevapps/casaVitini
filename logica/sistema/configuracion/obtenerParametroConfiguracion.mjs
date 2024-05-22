import { obtenerParConfiguracion } from '../../repositorio/configuracion/obtenerParConfiguracion.mjs';
export const obtenerParametroConfiguracion = async (configuracionUID) => {
    try {
        const filtroCadena = /^[a-zA-Z0-9]+$/;
        if (!configuracionUID || !filtroCadena.test(configuracionUID)) {
            const error = "El campo configuracionUID solo puede ser un una cadena de minúsculas, mayusculas y numeros y nada mas"
            throw new Error(error)
        }

        const parConfiguracion = await obtenerParConfiguracion([configuracionUID])
        return parConfiguracion[configuracionUID]
    } catch (errorCapturado) {
        throw error;
    }
}
