import { DateTime } from "luxon"
import { campoDeTransaccion } from "../../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs"
import { insertarServicioPorReservaUID } from "../../../../../infraestructure/repository/reservas/servicios/insertarServicioPorReservaUID.mjs"
import { obtenerServicioPorCriterioPublicoPorServicioUIDArray } from "../../../../../infraestructure/repository/servicios/obtenerServicioPorCriterioPublicoPorServicioUIDArray.mjs"
import { obtenerServicioPorServicioUID } from "../../../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs"
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs"
import { actualizadorIntegradoDesdeInstantaneas } from "../../../../../shared/contenedorFinanciero/entidades/reserva/actualizadorIntegradoDesdeInstantaneas.mjs"
import { validarObjetoDelServicio } from "../../../../../shared/reservas/detallesReserva/servicios/validarObjetoDelServicio.mjs"
import { validarOpcionesDelServicio } from "../../../../../shared/reservas/detallesReserva/servicios/validarOpcionesDelServicio.mjs"
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerFechaLocal } from "../../../../../shared/obtenerFechaLocal.mjs"

export const insertarServicioEnReserva = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
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
            devuelveUnTipoNumber: "si"
        })

        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
            nombreCampo: "El identificador universal del servicio (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const opcionesSeleccionadasDelServicio = entrada.body.opcionesSeleccionadasDelServicio
        const oSdS_validado = validarObjetoDelServicio({ opcionesSeleccionadasDelServicio })


        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        const estadoReserva = reserva.estadoIDV
        if (estadoReserva === "cancelada") {
            const error = "La reserva está cancelada, es inmutable."
            throw new Error(error)
        }

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


        await validarOpcionesDelServicio({
            opcionesSeleccionadasDelServicio: oSdS_validado,
            servicioExistenteAccesible: servicioExistenteAccesible[0]
        })


   
        await campoDeTransaccion("iniciar")
        const opcionesSeleccionadas = oSdS_validado.opcionesSeleccionadas
        const descuentoTotalServicio = oSdS_validado.descuentoTotalServicio
        const fechaUTC = DateTime.utc().toISO();
        contenedorServicio.fechaAdquisicion = fechaUTC


        const servicioEnReserva = await insertarServicioPorReservaUID({
            reservaUID,
            nombre: nombreServicico,
            contenedor: contenedorServicio,
            opcionesSel: opcionesSeleccionadas,
            descuentoTotalServicio: descuentoTotalServicio
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