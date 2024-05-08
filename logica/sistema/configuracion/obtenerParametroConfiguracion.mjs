import { conexion } from '../../componentes/db.mjs';
const obtenerParametroConfiguracion = async (configuracionUID) => {
    try {
        const filtroCadena = /^[a-zA-Z0-9]+$/;
        if (!configuracionUID || !filtroCadena.test(configuracionUID)) {
            const error = "El campo configuracionUID solo puede ser un una cadena de minúsculas, mayusculas y numeros y nada mas"
            throw new Error(error)
        }
        const seleccionarConfiguracion = `
        SELECT
        valor
        FROM 
        "configuracionGlobal"
        WHERE "configuracionUID" = $1
        `
        const resuelveConfiguracion = await conexion.query(seleccionarConfiguracion, [configuracionUID])
        if (resuelveConfiguracion.rowCount === 0) {
            const error = "No existe el parametro de configuracion buscado"
            throw new Error(error)
        }
        const parametrosConfiguracion = resuelveConfiguracion.rows[0].valor
        return parametrosConfiguracion
    } catch (error) {
        throw error;
    }
}
export {
    obtenerParametroConfiguracion
}