import { obtenerServicioPorServicioUID } from "../../../../repositorio/servicios/obtenerServicioPorServicioUID.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { insertarServicioPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/servicios/insertarServicioPorSimulacionUID.mjs"
import { validarDataGlobalDeSimulacion } from "../../../../sistema/simuladorDePrecios/validarDataGlobalDeSimulacion.mjs"
import { generarDesgloseSimpleGuardarlo } from "../../../../sistema/simuladorDePrecios/generarDesgloseSimpleGuardarlo.mjs"

export const insertarServicioEnSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacion (simulacionUID)",
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
        await campoDeTransaccion("iniciar")
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const servicio = await obtenerServicioPorServicioUID(servicioUID)
        const nombreServicico = servicio.nombre
        const contenedorServicio = servicio.contenedor
        contenedorServicio.servicioUID = servicio.servicioUID
        const servicioInsertado = await insertarServicioPorSimulacionUID({
            simulacionUID,
            nombre: nombreServicico,
            contenedor: contenedorServicio
        })
        await validarDataGlobalDeSimulacion(simulacionUID)
        const desgloseFinanciero = await generarDesgloseSimpleGuardarlo(simulacionUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha insertado el servicio correctamente en la reserva y el contenedor financiero se ha renderizado.",
            servicio: servicioInsertado,
            desgloseFinanciero: desgloseFinanciero
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }
}