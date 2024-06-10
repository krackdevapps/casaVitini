import { conexion } from "../../componentes/db.mjs";
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
            const error = "No existe ningun cliente con ese UID";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
