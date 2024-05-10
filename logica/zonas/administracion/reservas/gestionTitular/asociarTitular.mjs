import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";


export const asociarTitular = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const clienteUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.clienteUID,
            nombreCampo: "El identificador universal de la cliente (clienteUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const validarCliente = `
                            SELECT
                            uid,
                            nombre,
                            "primerApellido",
                            "segundoApellido",
                            pasaporte,
                            telefono,
                            email
                            FROM 
                            clientes
                            WHERE
                            uid = $1`;
        const resuelveValidarCliente = await conexion.query(validarCliente, [clienteUID]);
        if (resuelveValidarCliente.rowCount === 0) {
            const error = "No existe el cliente";
            throw new Error(error);
        }
        if (resuelveValidarCliente.rowCount === 1) {
            const consultaElimintarTitularPool = `
                                DELETE FROM 
                                "poolTitularesReserva"
                                WHERE
                                reserva = $1;
                                `;
            await conexion.query(consultaElimintarTitularPool, [reservaUID]);
            const eliminaTitular = `
                                DELETE FROM 
                                "reservaTitulares"
                                WHERE
                                "reservaUID" = $1;
                                `;
            await conexion.query(eliminaTitular, [reservaUID]);
            const nombre = resuelveValidarCliente.rows[0].nombre;
            const primerApellido = resuelveValidarCliente.rows[0].primerApellido ? resuelveValidarCliente.rows[0].primerApellido : "";
            const segundoApellido = resuelveValidarCliente.rows[0].segundoApellido ? resuelveValidarCliente.rows[0].segundoApellido : "";
            const pasaporte = resuelveValidarCliente.rows[0].pasaporte;
            const email = resuelveValidarCliente.rows[0].email ? resuelveValidarCliente.rows[0].email : "";
            const telefono = resuelveValidarCliente.rows[0].telefono ? resuelveValidarCliente.rows[0].telefono : "";
            const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
            await validadoresCompartidos.reservas.validarReserva(reservaUID);
            const consultaActualizarTitular = `
                                INSERT INTO "reservaTitulares"
                                (
                                "titularUID",
                                "reservaUID"
                                )
                                VALUES ($1, $2);`;
            const datosParaActualizar = [
                clienteUID,
                reservaUID
            ];
            const resuelveActualizarTitular = await conexion.query(consultaActualizarTitular, datosParaActualizar);
            if (resuelveActualizarTitular.rowCount === 0) {
                const error = "No se ha podido actualizar el titular de la reserva";
                throw new Error(error);
            }
            const ok = {
                ok: "Se ha actualizado correctamente el titular en la reserva",
                clienteUID: clienteUID,
                nombreCompleto: nombreCompleto,
                email: email,
                nombre: nombre,
                telefono: telefono,
                primerApellido: primerApellido,
                segundoApellido: segundoApellido,
                pasaporte: pasaporte
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}