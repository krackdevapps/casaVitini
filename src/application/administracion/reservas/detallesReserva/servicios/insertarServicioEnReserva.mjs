import { DateTime } from "luxon"
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { insertarServicioPorReservaUID } from "../../../../../infraestructure/repository/reservas/servicios/insertarServicioPorReservaUID.mjs"
import { obtenerServicioPorCriterioPublicoPorServicioUIDArray } from "../../../../../infraestructure/repository/servicios/obtenerServicioPorCriterioPublicoPorServicioUIDArray.mjs"
import { obtenerServicioPorServicioUID } from "../../../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { validarObjetoDelServicio } from "../../../../../shared/reservas/detallesReserva/servicios/validarObjetoDelServicio.mjs"
import { validarOpcionesDelServicio } from "../../../../../shared/reservas/detallesReserva/servicios/validarOpcionesDelServicio.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerFechaLocal } from "../../../../../shared/obtenerFechaLocal.mjs"
import { estadoInicialPagoServicio } from "../../../../../shared/reservas/servicios/estadoInicialPagoServicio.mjs"
import { sincronizarRegistros } from "../../../../../shared/reservas/detallesReserva/servicios/sincronizarRegistros.mjs"
import { obtenerElementoPorElementoUID } from "../../../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs"

export const insertarServicioEnReserva = async (entrada) => {
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

        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
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
        await campoDeTransaccion("iniciar")

        const servicio = await obtenerServicioPorServicioUID(servicioUID)



        const nombreServicico = servicio.nombre
        const contenedorServicio = servicio.contenedor
        contenedorServicio.servicioUID = servicio.servicioUID

        const servicioExistenteAccesible = await obtenerServicioPorCriterioPublicoPorServicioUIDArray({
            zonaIDVArray: [
                "privada",
                "global"
            ],
            estadoIDV: "activado",
            serviciosUIDArray: [servicioUID]
        })

        if (servicioExistenteAccesible.length === 0) {
            const m = "No se encuentra el servicio, verifique que el servicio este configurado en la zona global o privada y que este Activado"
            throw new Error(m)
        }
        const contenedorInventario_pipe = []
        await validarOpcionesDelServicio({
            opcionesSeleccionadasDelServicio: oSdS_validado,
            servicioExistenteAccesible: servicioExistenteAccesible[0],
            contenedorInventario_pipe
        })

        const opcionesSeleccionadas = oSdS_validado.opcionesSeleccionadas
        const descuentoTotalServicio = oSdS_validado.descuentoTotalServicio
        const fechaUTC = DateTime.utc().toISO();
        contenedorServicio.fechaAdquisicion = fechaUTC
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
                        throw new Error(`No se puede insertar este servicio porque la opción ${nombreOpcion} está enlazada con un elemento que ya no está en el inventario. Por favor, ves al servicio y desenlaza la opción`)
                    }
                }
            }
        }
        const eIP = estadoInicialPagoServicio({
            gruposDeOpciones
        })

        await sincronizarRegistros({
            opcionesSeleccionadasDelServicio: oSdS_validado,
            servicioExistenteAccesible: servicioExistenteAccesible[0],
        })

        const servicioEnReserva = await insertarServicioPorReservaUID({
            reservaUID,
            nombre: nombreServicico,
            contenedor: contenedorServicio,
            opcionesSel: opcionesSeleccionadas,
            descuentoTotalServicio: descuentoTotalServicio,
            estadoPagoIDV: eIP
        })

        await actualizadorIntegradoDesdeInstantaneas(reservaUID)
        servicioEnReserva.contenedor.fechaAdquisicionLocal = await obtenerFechaLocal(fechaUTC)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el servicio correctamente en la reserva y el contenedor financiero se ha renderizado.",
            servicio: servicioEnReserva,
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}