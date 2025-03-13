import { obtenerServicioPorServicioUID } from "../../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { insertarServicioPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/insertarServicioPorSimulacionUID.mjs"
import { validarObjetoDelServicio } from "../../../../shared/reservas/detallesReserva/servicios/validarObjetoDelServicio.mjs"
import { obtenerServicioPorCriterioPublicoPorServicioUIDArray } from "../../../../infraestructure/repository/servicios/obtenerServicioPorCriterioPublicoPorServicioUIDArray.mjs"
import { validarOpcionesDelServicio } from "../../../../shared/reservas/detallesReserva/servicios/validarOpcionesDelServicio.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { DateTime } from "luxon"
import { obtenerFechaLocal } from "../../../../shared/obtenerFechaLocal.mjs"

export const insertarServicioEnSimulacion = async (entrada) => {
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

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacion (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const servicioUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID,
            nombreCampo: "El identificador universal del servicio (servicioUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "si"
        })

        const opcionesSeleccionadasDelServicio = entrada.body.opcionesSeleccionadasDelServicio
        const oSdS_validado = validarObjetoDelServicio({ opcionesSeleccionadasDelServicio })

        await campoDeTransaccion("iniciar")
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const servicio = await obtenerServicioPorServicioUID(servicioUID)
        const nombreServicico = servicio.nombre
        const contenedorServicio = servicio.contenedor
        const estadoIDV = servicio.estadoIDV
        contenedorServicio.servicioUID = servicio.servicioUID

        if (estadoIDV !== "activado") {
            const m = "El servicio no esta activado"
            throw new Error(m)

        }

        const servicioExistenteAccesible = await obtenerServicioPorCriterioPublicoPorServicioUIDArray({
            zonaIDVArray: [
                "privada",
                "global",
                "publica"
            ],
            estadoIDV: "activado",
            serviciosUIDArray: [servicioUID]
        })

        await validarOpcionesDelServicio({
            opcionesSeleccionadasDelServicio: oSdS_validado,
            servicioExistenteAccesible: servicioExistenteAccesible[0]
        })
        const opcionesSeleccionadas = oSdS_validado.opcionesSeleccionadas
        const descuentoTotalServicio = oSdS_validado.descuentoTotalServicio

        const fechaUTC = DateTime.utc().toISO();
        contenedorServicio.fechaAdquisicion = fechaUTC

        const servicioInsertado = await insertarServicioPorSimulacionUID({
            simulacionUID,
            nombre: nombreServicico,
            contenedor: contenedorServicio,
            opcionesSel: opcionesSeleccionadas,
            descuentoTotalServicio: descuentoTotalServicio

        })

        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)
        servicioInsertado.contenedor.fechaAdquisicionLocal = await obtenerFechaLocal(fechaUTC)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el servicio correctamente en la reserva y el contenedor financiero se ha renderizado.",
            servicio: servicioInsertado,
            simulacionUID,
            ...postProcesadoSimualacion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}