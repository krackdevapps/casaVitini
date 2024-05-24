import { conexion } from "../../componentes/db.mjs";
export const obtenerEnlaceDePagoPorCodigoUPID = async (codigoUPID) => {
    try {
        const consulta = `
            SELECT
            "enlaceUID"
            "nombreEnlace", 
            codigo, 
            "reservaUID",
            "estadoPagoIDV",
            TO_CHAR("fechaCaducidad" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS fechaCaducidad
            FROM "enlacesDePago"
            WHERE codigo = $1;`;
        const resuelve = await conexion.query(consulta, [codigoUPID]);
        if (resuelve.rowCount === 0) {
            const error = "No se ha podido obtener ningun enlace de pago con ese codigoUPID";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

