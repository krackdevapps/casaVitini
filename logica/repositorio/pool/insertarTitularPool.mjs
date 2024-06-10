import { conexion } from "../../componentes/db.mjs";

export const insertarTitularPool = async (data) => {
    try {
        const titularReservaPool = data.titularReservaPool
        const pasaporteTitularPool = data.pasaporteTitularPool
        const correoTitular = data.correoTitular
        const telefonoTitular = data.telefonoTitular
        const reservaUID = data.reservaUID

        const insertarCliente = `
        INSERT INTO
        "poolTitularesReserva"
        (
        "nombreTitular",
        "pasaporteTitular",
        "mailTitular",
        "telefonoTitular",
        "reservaUID"
        )
        VALUES 
        ($1, $2, $3, $4, $5)
        RETURNING
        *;`
        const datosClientes = [
            titularReservaPool,
            pasaporteTitularPool,
            correoTitular,
            telefonoTitular,
            reservaUID
        ]
        const resuelveInsertarCliente = await conexion.query(insertarCliente, datosClientes)
        if (resuelveInsertarCliente.rowCount === 0) {
            const error = "No se ha insertardo el cliente en la base de datos"
            throw new Error(error)
        }
        const nuevoCliente = resuelveInsertarCliente.rows[0]
        return nuevoCliente

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
