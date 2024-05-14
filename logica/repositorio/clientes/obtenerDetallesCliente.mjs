import { conexion } from "../../componentes/db.mjs";
export const obtenerDetallesCliente = async (clienteUID) => {
    try {
        const consulta = `
        SELECT 
        uid, 
        nombre,
        "primerApellido",
        "segundoApellido",
        pasaporte,
        telefono,
        email,
        notas 
        FROM 
        clientes 
        WHERE 
        uid = $1`;
        const resuelve = await conexion.query(consulta, [clienteUID])
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun cliente con ese UID";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (error) {
        throw error
    }
}
