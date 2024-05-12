import { conexion } from "../../componentes/db.mjs";
export const actualizarCliente = async (data) => {
    try {
        const nombre = data.nombre
        const primerApellido = data.primerApellido
        const segundoApellido = data.segundoApellido
        const pasaporte = data.pasaporte
        const telefono = data.telefono
        const correoElectronico = data.correoElectronico
        const notas = data.notas
        const cliente = data.cliente

        const consulta = `
            UPDATE clientes
            SET 
            nombre = COALESCE($1, nombre),
            "primerApellido" = COALESCE($2, "primerApellido"),
            "segundoApellido" = COALESCE($3, "segundoApellido"),
            pasaporte = COALESCE($4, pasaporte),
            telefono = COALESCE($5, telefono),
            email = COALESCE($6, email),
            notas = COALESCE($7, notas)
            WHERE uid = $8
            RETURNING
            nombre,
            "primerApellido",
            "segundoApellido",
            pasaporte,
            telefono,
            email,
            notas;
            `;
        const datosCliente = [
            nombre,
            primerApellido,
            segundoApellido,
            pasaporte,
            telefono,
            correoElectronico,
            notas,
            cliente
        ]
        const resuelve = await conexion.query(consulta, datosCliente);
        if (resuelve.rowCount === 0) {
            const error = "No existe el cliente, revisa su identificador";
            throw new Error(error)
        }
        if (resuelve.rowCount === 1) {
            const clienteActualizado = resuelve.rows[0]
            return clienteActualizado
        }
    } catch (error) {
        throw error
    }
}
