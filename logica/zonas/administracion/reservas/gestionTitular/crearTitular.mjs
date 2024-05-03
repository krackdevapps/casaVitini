import { conexion } from "../../../../componentes/db.mjs";
import { insertarCliente } from "../../../../sistema/insertarCliente.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const crearTitular = async (entrada, salida) => {
    try {
        const reservaUID = entrada.body.reservaUID;
        let nombre = entrada.body.nombre;
        let primerApellido = entrada.body.primerApellido;
        let segundoApellido = entrada.body.segundoApellido;
        let pasaporte = entrada.body.pasaporte;
        let telefono = entrada.body.telefono;
        let correoElectronico = entrada.body.correo;
        let notas = entrada.body?.notas;
        await conexion.query('BEGIN'); // Inicio de la transacción
        const reserva = await validadoresCompartidos.reservas.validarReserva(reservaUID);
        const consultaElimintarTitularPool = `
                            DELETE FROM 
                            "poolTitularesReserva"
                            WHERE
                            reserva = $1;`;
        await conexion.query(consultaElimintarTitularPool, [reservaUID]);
        const eliminaTitular = `
                            DELETE FROM 
                            "reservaTitulares"
                            WHERE
                            "reservaUID" = $1;
                            `;
        await conexion.query(eliminaTitular, [reservaUID]);
        const nuevoClientePorValidar = {
            nombre: nombre,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte,
            telefono: telefono,
            correoElectronico: correoElectronico,
        };
        const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoClientePorValidar);
        const datosNuevoCliente = {
            nombre: datosValidados.nombre,
            primerApellido: datosValidados.primerApellido,
            segundoApellido: datosValidados.segundoApellido,
            pasaporte: datosValidados.pasaporte,
            telefono: datosValidados.telefono,
            correoElectronico: datosValidados.correoElectronico
        };
        const nuevoCliente = await insertarCliente(datosNuevoCliente);
        const clienteUID = nuevoCliente.uid;
        const nombre_ = datosValidados.nombre;
        const primerApellido_ = datosValidados.primerApellido ? datosValidados.primerApellido : "";
        const segundoApellido_ = datosValidados.segundoApellido ? nuevoCliente.segundoApellido : "";
        const email_ = datosValidados.email ? datosValidados.email : "";
        const pasaporte_ = datosValidados.pasaporte;
        const telefono_ = datosValidados.telefono ? datosValidados.telefono : "";
        const nombreCompleto = `${nombre_} ${primerApellido_} ${segundoApellido_}`;
        // Asociar nuevo cliente como titular
        const consultaInsertaTitularReserva = `
                            INSERT INTO "reservaTitulares"
                            (
                            "titularUID",
                            "reservaUID"
                            )
                            VALUES ($1, $2);`;
        const resuelveInsertarTitular = await conexion.query(consultaInsertaTitularReserva, [clienteUID, reservaUID]);
        if (resuelveInsertarTitular.rowCount === 0) {
            const error = "No se ha podio insertar el titular por favor vuelve a intentarlo";
            throw new Error(error);
        }
        if (resuelveInsertarTitular.rowCount === 1) {
            const ok = {
                ok: "Se  ha insertado el nuevo cliente en la base de datos y se ha asociado a la reserva",
                nombreCompleto: nombreCompleto,
                clienteUID: clienteUID,
                nombre: nombre_,
                primerApellido: primerApellido_,
                segundoApellido: segundoApellido_,
                email: email_,
                telefono: telefono_,
                pasaporte: pasaporte_
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT'); // Confirmar la transacción
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}