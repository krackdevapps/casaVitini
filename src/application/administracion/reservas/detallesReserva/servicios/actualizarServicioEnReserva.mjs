import { DateTime } from "luxon"
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { actualizarServicioPorReservaUID } from "../../../../../infraestructure/repository/reservas/servicios/actualizarServicioPorReservaUID.mjs"
import { obtenerServicioEnReservaPorServicioUID } from "../../../../../infraestructure/repository/reservas/servicios/obtenerServicioEnReservaPorServicioUID.mjs"

import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { validarObjetoDelServicio } from "../../../../../shared/reservas/detallesReserva/servicios/validarObjetoDelServicio.mjs"
import { validarOpcionesDelServicio } from "../../../../../shared/reservas/detallesReserva/servicios/validarOpcionesDelServicio.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerFechaLocal } from "../../../../../shared/obtenerFechaLocal.mjs"
import { controladorDelMovimiento } from "../../../../../shared/inventario/controladorDeMovimiento.mjs"
import { sincronizarRegistros } from "../../../../../shared/reservas/detallesReserva/servicios/sincronizarRegistros.mjs"
import { obtenerElementoPorElementoUID } from "../../../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs"

export const actualizarServicioEnReserva = async (entrada) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
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

        const servicioUID_enReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID_enReserva,
            nombreCampo: "El identificador universal del servicio (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const opcionesSeleccionadasDelServicio = entrada.body.opcionesSeleccionadasDelServicio
        const oSdS_validado = validarObjetoDelServicio({ opcionesSeleccionadasDelServicio })


        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }

        const servicio = await obtenerServicioEnReservaPorServicioUID(servicioUID_enReserva)
        const nombreServicico = servicio.nombre
        const contenedorServicio = servicio.contenedor
        //contenedorServicio.servicioUID = servicio.servicioUID
        await campoDeTransaccion("iniciar")

        await validarOpcionesDelServicio({
            opcionesSeleccionadasDelServicio: oSdS_validado,
            servicioExistenteAccesible: servicio,
        })

        const gruposDeOpciones = contenedorServicio.gruposDeOpciones

        for (const [grupoIDV, gDO] of Object.entries(gruposDeOpciones)) {
            const opcionesGrupo = gDO.opcionesGrupo
            for (const og of opcionesGrupo) {
                const elementoUID = og?.elementoEnlazado?.elementoUID
                const nombreOpcion = og.nombreOpcion
                if (elementoUID) {
                    const elemento = await obtenerElementoPorElementoUID({
                        elementoUID,
                        errorSi: "desactivado"
                    })
                    if (!elemento) {
                        throw new Error(`No se puede actualizar este servicio porque la opción ${nombreOpcion} está enlazada con un elemento que ya no está en el inventario. Por favor, ves al servicio y desenlaza la opción`)
                    }
                }
            }
        }


        const opcionesSeleccionadas = oSdS_validado.opcionesSeleccionadas
        const descuentoTotalServicio = oSdS_validado.descuentoTotalServicio
        const fechaUTC = DateTime.utc().toISO();
        contenedorServicio.fechaAdquisicion = fechaUTC


        await sincronizarRegistros({
            opcionesSeleccionadasDelServicio: oSdS_validado,
            servicioExistenteAccesible: servicio,
        })

        const servicioEnReserva = await actualizarServicioPorReservaUID({
            reservaUID,
            servicioUID_enReserva,
            nombre: nombreServicico,
            contenedor: contenedorServicio,
            opcionesSel: opcionesSeleccionadas,
            descuentoTotalServicio: descuentoTotalServicio
        })
        await actualizadorIntegradoDesdeInstantaneas(reservaUID)
        servicioEnReserva.contenedor.fechaAdquisicionLocal = await obtenerFechaLocal(fechaUTC)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el servicio correctamente en la reserva y el contenedor financiero se ha renderizado.",
            servicio: servicioEnReserva,
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}