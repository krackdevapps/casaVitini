import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { validarObjetoDelServicio } from "../../../../shared/reservas/detallesReserva/servicios/validarObjetoDelServicio.mjs"
import { validarOpcionesDelServicio } from "../../../../shared/reservas/detallesReserva/servicios/validarOpcionesDelServicio.mjs"
import { actualizarServicioPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/actualizarServicioPorSimulacionUID.mjs"
import { obtenerServicioEnSimulacionPorServicioUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServicioEnSimulacionPorServicioUID.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { controladorGeneracionDesgloseFinanciero } from "../../../../shared/simuladorDePrecios/controladorGeneracionDesgloseFinanciero.mjs"
import { DateTime } from "luxon"
import { obtenerFechaLocal } from "../../../../shared/obtenerFechaLocal.mjs"

export const actualizarServicioEnSimulacion = async (entrada) => {
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
            devuelveUnTipoBigInt: "no"
        })

        const servicioUID_enSimulacion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID_enSimulacion,
            nombreCampo: "El identificador universal del servicio (servicioUID_enSimulacion)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })

        const opcionesSeleccionadasDelServicio = entrada.body.opcionesSeleccionadasDelServicio
        const oSdS_validado = validarObjetoDelServicio({ opcionesSeleccionadasDelServicio })


        await obtenerSimulacionPorSimulacionUID(simulacionUID)

        const servicio = await obtenerServicioEnSimulacionPorServicioUID(servicioUID_enSimulacion)
        const nombreServicico = servicio.nombre
        const contenedorServicio = servicio.contenedor
        contenedorServicio.servicioUID = servicio.servicioUID


        await validarOpcionesDelServicio({
            opcionesSeleccionadasDelServicio: oSdS_validado,
            servicioExistenteAccesible: servicio
        })
        const opcionesSeleccionadas = oSdS_validado.opcionesSeleccionadas
        const descuentoTotalServicio = oSdS_validado.descuentoTotalServicio
        const fechaUTC = DateTime.utc().toISO();
        contenedorServicio.fechaAdquisicion = fechaUTC

        await campoDeTransaccion("iniciar")
        const servicioEnSimulacion = await actualizarServicioPorSimulacionUID({
            simulacionUID,
            servicioUID_enSimulacion,
            opcionesSel: opcionesSeleccionadas,
            descuentoTotalServicio: descuentoTotalServicio

        })
        const postProcesadoSimualacion = await controladorGeneracionDesgloseFinanciero(simulacionUID)
        servicioEnSimulacion.contenedor.fechaAdquisicionLocal = await obtenerFechaLocal(fechaUTC)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado el servicio correctamente en la simulación y el contenedor financiero se ha renderizado.",
            servicio: servicioEnSimulacion,
            simulacionUID,
            ...postProcesadoSimualacion
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}