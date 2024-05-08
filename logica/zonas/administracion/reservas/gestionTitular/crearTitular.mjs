import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { insertarCliente } from "../../../../sistema/clientes/insertarCliente.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const crearTitular = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const reservaUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        await validadoresCompartidos.reservas.validarReserva(reservaUID);
        await conexion.query('BEGIN'); // Inicio de la transacción

        const datosCliente = {
            nombre: entrada.body.nombre,
            primerApellido: entrada.body.primerApellido,
            segundoApellido: entrada.body.segundoApellido,
            pasaporte: entrada.body.pasaporte,
            telefono: entrada.body.telefono,
            correoElectronico: entrada.body.correoElectronico,
            notas: entrada.body.notas,
        };
        const datosValidados = await validadoresCompartidos.clientes.validarCliente(datosCliente);
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

        const nuevoCliente = await insertarCliente(datosValidados);
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