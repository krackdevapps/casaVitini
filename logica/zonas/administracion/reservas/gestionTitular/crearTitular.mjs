import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { insertarCliente } from "../../../../repositorio/clientes/insertarCliente.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../../sistema/error/filtroError.mjs";
import { eliminarTitularPoolPorReservaUID } from "../../../../repositorio/reservas/eliminarTitularPoolPorReservaUID.mjs";
import { eliminarTitularPorReservaUID } from "../../../../repositorio/reservas/eliminarTitularPorReservaUID.mjs";
import { campoDeTransaccion } from "../../../../componentes/campoDeTransaccion.mjs";

export const crearTitular = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reservaUID = validadoresCompartidos.tipos.numero({
            number: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        await validadoresCompartidos.reservas.validarReserva(reservaUID);

        await campoDeTransaccion("iniciar")

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
        await eliminarTitularPoolPorReservaUID(reservaUID)
        await eliminarTitularPorReservaUID(reservaUID)

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
        const dataTitular = {
            clienteUID: clienteUID,
            reservaUID: reservaUID
        }
        await insertarTitularEnReserva(dataTitular)
        await campoDeTransaccion("confirmar")

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
    catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}