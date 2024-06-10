import { conexion } from "../../componentes/db.mjs";
export const eliminarEnlacesDePagoPorCaducidad = async (fechaActual) => {
    try {
        const consulta = `
        DELETE FROM
        "enlacesDePago"
        WHERE
        "fechaCaducidad" < $1`
        const resuelve = await conexion.query(consulta, [fechaActual]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

