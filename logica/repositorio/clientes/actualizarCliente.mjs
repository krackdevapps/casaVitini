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
        const clienteUID = data.clienteUID

        const consulta = `
            UPDATE clientes
            SET 
            nombre = COALESCE($1, nombre),
            "primerApellido" = COALESCE($2, "primerApellido"),
            "segundoApellido" = COALESCE($3, "segundoApellido"),
            pasaporte = COALESCE($4, pasaporte),
            telefono = COALESCE($5, telefono),
            mail = COALESCE($6, mail),
            notas = COALESCE($7, notas)
            WHERE 
            "clienteUID" = $8
            RETURNING
            *
            `;
        const datosCliente = [
            nombre,
            primerApellido, 
            segundoApellido,
            pasaporte,
            telefono,
            correoElectronico,
            notas,
            clienteUID
        ]
        const resuelve = await conexion.query(consulta, datosCliente);
        if (resuelve.rowCount === 0) {
            const error = "No existe el cliente, revisa su identificador";
            throw new Error(error)
        }
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
