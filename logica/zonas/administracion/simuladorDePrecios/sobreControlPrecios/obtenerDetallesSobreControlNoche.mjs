import { obtenerDetalleNochePorFechaNochePorApartamentoIDV } from "../../../../repositorio/simulacionDePrecios/sobreControlDePrecios/obtenerDetalleNochePorFechaNochePorApartamentoIDV.mjs"
import { obtenerSobreControlDeLaNoche } from "../../../../repositorio/simulacionDePrecios/sobreControlDePrecios/obtenerSobreControlDeLaNoche.mjs"
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs"
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../repositorio/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"

export const obtenerDetallesSobreControlNoche = async (entrada) => {
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
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
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
        const detallesSobreControlApartamento = await obtenerSobreControlDeLaNoche({
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