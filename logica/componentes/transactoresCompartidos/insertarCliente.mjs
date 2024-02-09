import { conexion } from "../db.mjs";
import { validadoresCompartidos } from "../validadoresCompartidos.mjs";

const insertarCliente = async (nuevoCliente) => {
    try {
        const nombre = nuevoCliente.nombre
        const primerApellido = nuevoCliente.primerApellido
        const segundoApellido = nuevoCliente.segundoApellido
        const pasaporte = nuevoCliente.pasaporte
        const telefono = nuevoCliente.telefono
        const correoElectronico = nuevoCliente.correoElectronico
        const notas = nuevoCliente.notas
       
        const insertarCliente = `
        INSERT INTO 
        clientes
        (
        nombre,
        "primerApellido",
        "segundoApellido",
        pasaporte,
        telefono,
        email,
        notas
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7) 
        RETURNING
        uid,
        nombre,
        "primerApellido",
        "segundoApellido",
        pasaporte,
        telefono,
        email,
        notas
        `
        const datosClientes = [
            nombre,
            primerApellido,
            segundoApellido,
            pasaporte,
            telefono,
            correoElectronico,
            notas
        ]
        const resuelveInsertarCliente = await conexion.query(insertarCliente, datosClientes)
        if (resuelveInsertarCliente.rowCount === 0) {
            const error = "No se ha insertardo el cliente en la base de datos"
            throw new Error(error)
        }
        if (resuelveInsertarCliente.rowCount === 1) {
            const nuevoCliente = resuelveInsertarCliente.rows[0]

            return nuevoCliente
        }
    } catch (error) {
        throw error
    }
}

export {
    insertarCliente
}