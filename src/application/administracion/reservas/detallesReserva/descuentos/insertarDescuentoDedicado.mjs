import { Mutex } from "async-mutex"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"
import { validarObjetoOferta } from "../../../../../shared/ofertas/entidades/reserva/validarObjetoOferta.mjs"
import { obtenerOfertasPorNombreUI } from "../../../../../infraestructure/repository/ofertas/obtenerOfertasPorNombreUI.mjs"
import { insertarOferta } from "../../../../../infraestructure/repository/ofertas/insertarOferta.mjs"
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { insertarDescuentoPorReservaUID } from "../../../../../infraestructure/repository/reservas/descuentos/insertarDescuentoPorReservaUID.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { DateTime } from "luxon"

export const insertarDescuentoDedicado = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 7
        })
        await mutex.acquire();

        const data = entrada.body
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: data.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }


        const descuentoDedicadoRaw = data.descuentoDedicado

        const tiempoZH = DateTime.now();
        const fechaActual = tiempoZH.toFormat("yyyyMMddHHmmssSSS")

        const descuentoDedicado = {
            nombreOferta: descuentoDedicadoRaw?.nombreOferta,
            zonaIDV: "global",
            entidadIDV: "reserva",
            fechaInicio: reserva.fechaEntrada,
            fechaFinal: reserva.fechaSalida,
            condicionesArray: [],
            descuentosJSON: descuentoDedicadoRaw?.descuentosJSON
        }
        await validarObjetoOferta({
            oferta: descuentoDedicado,
            modo: "crearOferta",
            filtroCondiciones: "desactivado"
        })
        descuentoDedicado.ofertaUID = fechaActual
        const nombreOferta = descuentoDedicado.nombreOferta

        await campoDeTransaccion("iniciar")
        const ofertasPorNombre = await obtenerOfertasPorNombreUI(nombreOferta)
        if (ofertasPorNombre.length > 0) {
            const error = "Ya existe un nombre de oferta exactamente igual a este, por favor elige otro nombre para esta oferta con el fin de evitar confusiones";
            throw new Error(error);
        }

        const nuevaOferta = await insertarDescuentoPorReservaUID({
            reservaUID,
            descuentoDedicado: {
                oferta: descuentoDedicado
            }
        })
        await actualizadorIntegradoDesdeInstantaneas(reservaUID)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha creado la oferta",
            oferta: nuevaOferta
        }
        return ok

    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}