import { conexion } from "../../componentes/db.mjs";
export const eliminarEnlacesDePagoPorCaducidad = async (fechaActual) => {
    try {
        const consulta = `
        DELETE FROM
        "enlacesDePago"
        WHERE
        caducidad < $1`
        const resuelve = await conexion.query(consulta, [fechaActual]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

