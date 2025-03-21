import { eliminarTitularPoolPorReservaUID } from "../../../../../infraestructure/repository/reservas/titulares/eliminarTitularPoolPorReservaUID.mjs";
import { eliminarTitularPorReservaUID } from "../../../../../infraestructure/repository/reservas/titulares/eliminarTitularPorReservaUID.mjs";
import { obtenerDetallesCliente } from "../../../../../infraestructure/repository/clientes/obtenerDetallesCliente.mjs";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { insertarTitularEnReserva } from "../../../../../infraestructure/repository/reservas/titulares/insertarTitularEnReserva.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const asociarTitular = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const clienteUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.clienteUID,
            nombreCampo: "El identificador universal de la clienteUID (clienteUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const detallesCliente = await obtenerDetallesCliente(clienteUID)
        await eliminarTitularPoolPorReservaUID(reservaUID)
        await eliminarTitularPorReservaUID(reservaUID)

        const nombre = detallesCliente.nombre;
        const primerApellido = detallesCliente.primerApellido ? detallesCliente.primerApellido : "";
        const segundoApellido = detallesCliente.segundoApellido ? detallesCliente.segundoApellido : "";
        const pasaporte = detallesCliente.pasaporte;
        const mail = detallesCliente.mail ? detallesCliente.mail : "";
        const telefono = detallesCliente.telefono ? detallesCliente.telefono : "";
        const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
        await obtenerReservaPorReservaUID(reservaUID)

        const dataTitular = {
            clienteUID: clienteUID,
            reservaUID: reservaUID
        }
        await insertarTitularEnReserva(dataTitular)
        const ok = {
            ok: "Se ha actualizado correctamente el titular en la reserva",
            clienteUID: clienteUID,
            nombreCompleto: nombreCompleto,
            mail: mail,
            nombre: nombre,
            telefono: telefono,
            primerApellido: primerApellido,
            segundoApellido: segundoApellido,
            pasaporte: pasaporte
        };
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}