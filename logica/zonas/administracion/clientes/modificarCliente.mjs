import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const modificarCliente = async (entrada, salida) => {
    const mutex = new Mutex();
    const bloqueoModificarClinete = await mutex.acquire();
    try {
        let cliente = entrada.body.cliente;
        let nombre = entrada.body.nombre;
        let primerApellido = entrada.body.primerApellido;
        let segundoApellido = entrada.body.segundoApellido;
        let pasaporte = entrada.body.pasaporte;
        let telefono = entrada.body.telefono;
        let correoElectronico = entrada.body.email;
        let notas = entrada.body.notas;
        if (!cliente || !Number.isInteger(cliente)) {
            const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente";
            throw new Error(error);
        }
        const clienteParaValidar = {
            nombre: nombre,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte,
            telefono: telefono,
            correoElectronico: correoElectronico,
            notas: notas,
        };
        const datosValidados = await validadoresCompartidos.clientes.actualizarCliente(clienteParaValidar);
        nombre = datosValidados.nombre;
        primerApellido = datosValidados.primerApellido;
        segundoApellido = datosValidados.segundoApellido;
        pasaporte = datosValidados.pasaporte;
        telefono = datosValidados.telefono;
        correoElectronico = datosValidados.correoElectronico;
        notas = datosValidados.notas;
        const validarCliente = `
                            SELECT
                            uid
                            FROM 
                            clientes
                            WHERE
                            uid = $1`;
        const resuelveValidarCliente = await conexion.query(validarCliente, [cliente]);
        if (resuelveValidarCliente.rowCount === 0) {
            const error = "No existe el cliente";
            throw new Error(error);
        }
        const actualizarCliente = `
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
        const resuelveActualizarCliente = await conexion.query(actualizarCliente, [nombre, primerApellido, segundoApellido, pasaporte, telefono, correoElectronico, notas, cliente]);
        if (resuelveActualizarCliente.rowCount === 0) {
            const error = "No se ha actualizado el cliente por que la base de datos no ha entontrado al cliente";
            throw new Error(error);
        }
        const ok = {
            ok: "Se ha anadido correctamente el cliente",
            detallesCliente: resuelveActualizarCliente.rows
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        bloqueoModificarClinete();
    }
}