import { obtenerDetalleNochePorFechaNochePorApartamentoIDV } from "../../../../infraestructure/repository/simulacionDePrecios/sobreControlDePrecios/obtenerDetalleNochePorFechaNochePorApartamentoIDV.mjs"

import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { obtenerSobreControlDeLaNocheDesdeSimulacion } from "../../../../infraestructure/repository/simulacionDePrecios/sobreControlDePrecios/obtenerSobreControlDeLaNocheDesdeSimulacion.mjs"

export const obtenerDetallesSobreControlNoche = async (entrada) => {
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo de apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const fechaNoche = await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaNoche,
            nombreCampo: "El campo fechaNoche"
        })
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        const instantaneaNetoApartamento = await obtenerDetalleNochePorFechaNochePorApartamentoIDV({
            simulacionUID,
            apartamentoIDV,
            fechaNoche
        })
        const detallesSobreControlApartamento = await obtenerSobreControlDeLaNocheDesdeSimulacion({
            simulacionUID,
            apartamentoIDV,
            fechaNoche
        })
        const ok = {
            ok: {
                instantaneaNetoApartamento,
                sobreControl: detallesSobreControlApartamento || {}
            }
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}