import { conexion } from "../globales/db.mjs";
export const obtenerDetallesCliente = async (clienteUID) => {
    try {
        const consulta = `
        SELECT 
        "clienteUID", 
        nombre,
        "primerApellido",
        "segundoApellido",
        pasaporte,
        telefono,
        mail,
        notas 
        FROM 
        clientes 
        WHERE 
        "clienteUID" = $1`;
        const resuelve = await conexion.query(consulta, [clienteUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe ningún cliente con ese UID";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
