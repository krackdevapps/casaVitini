import { conexion } from "../../componentes/db.mjs";
export const obtenerEnlaceDePagoPorCodigoUPID = async (data) => {
    try {
        const codigoUPID = data.codigoUPID
        const errorSi = data.errorSi

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
        if (errorSi === "noExiste") {
            if (resuelve.rowCount === 0) {
                const error = "No se ha podido obtener ningun enlace de pago con ese codigoUPID";
                throw new Error(error)
            }
            return resuelve.rows[0]

        } else if (errorSi === "existe") {
            if (resuelve.rowCount > 0) {
                const error = "Ya exiete el enlace de pago";
                throw new Error(error)
            }
            return resuelve.rows[0]
        } else if (errorSi === "desactivado") {
            return resuelve.rows
        } else {
            const error = "el adaptador obtenerEnlaceDePagoPorCodigoUPID necesita errorSi en existe, noExiste o desactivado"
            throw new Error(error)
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}

