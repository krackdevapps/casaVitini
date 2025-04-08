
import { insertarCliente } from "../../../../../infraestructure/repository/clientes/insertarCliente.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarTitularPoolPorReservaUID } from "../../../../../infraestructure/repository/reservas/titulares/eliminarTitularPoolPorReservaUID.mjs";
import { eliminarTitularPorReservaUID } from "../../../../../infraestructure/repository/reservas/titulares/eliminarTitularPorReservaUID.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { insertarTitularEnReserva } from "../../../../../infraestructure/repository/reservas/titulares/insertarTitularEnReserva.mjs";

export const crearTitular = async (entrada, salida) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 8
        })

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        await obtenerReservaPorReservaUID(reservaUID);

        await campoDeTransaccion("iniciar")

        const datosCliente = {
            cliente: {
                nombre: entrada.body.nombre,
                primerApellido: entrada.body.primerApellido,
                segundoApellido: entrada.body.segundoApellido,
                pasaporte: entrada.body.pasaporte,
                telefono: entrada.body.telefono,
                correoElectronico: entrada.body.correoElectronico,
                notas: entrada.body.notas,
            },
            operacion: "crear"
        };


        const datosValidados = await validadoresCompartidos.clientes.validarCliente(datosCliente);


        await eliminarTitularPoolPorReservaUID(reservaUID)
        await eliminarTitularPorReservaUID(reservaUID)

        const nuevoCliente = await insertarCliente(datosValidados);
        const clienteUID = nuevoCliente.clienteUID;
        const nombre_ = datosValidados.nombre;
        const primerApellido_ = datosValidados.primerApellido ? datosValidados.primerApellido : "";
        const segundoApellido_ = datosValidados.segundoApellido ? nuevoCliente.segundoApellido : "";
        const mail_ = datosValidados.mail ? datosValidados.mail : "";
        const pasaporte_ = datosValidados.pasaporte;
        const telefono_ = datosValidados.telefono ? datosValidados.telefono : "";
        const nombreCompleto = `${nombre_} ${primerApellido_} ${segundoApellido_}`;

        const dataTitular = {
            clienteUID: clienteUID,
            reservaUID: reservaUID
        }
        await insertarTitularEnReserva(dataTitular)
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha insertado el nuevo cliente en la base de datos y se ha asociado a la reserva",
            nombreCompleto: nombreCompleto,
            clienteUID: clienteUID,
            nombre: nombre_,
            primerApellido: primerApellido_,
            segundoApellido: segundoApellido_,
            mail: mail_,
            telefono: telefono_,
            pasaporte: pasaporte_
        };
        return ok
    }
    catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}