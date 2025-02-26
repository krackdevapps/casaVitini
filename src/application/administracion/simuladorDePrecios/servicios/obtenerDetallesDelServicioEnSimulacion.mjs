import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { obtenerServicioEnSimulacionPorServicioUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServicioEnSimulacionPorServicioUID.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"

export const obtenerDetallesDelServicioEnSimulacion = async (entrada) => {
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
            nombreCampo: "El identificador universal de la simulación (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const servicioUID_enSimulacion = validadoresCompartidos.tipos.cadena({
            string: entrada.body.servicioUID_enSimulacion,
            nombreCampo: "El identificador universal del servicio (servicioUID_enSimulacion)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        
        const servicio = await obtenerServicioEnSimulacionPorServicioUID(servicioUID_enSimulacion)
        const contenedorServicio = servicio.contenedor
        contenedorServicio.servicioUID = servicio.servicioUID

        const ok = {
            ok: "Detalles del servicio en la simulación",
            servicio
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}