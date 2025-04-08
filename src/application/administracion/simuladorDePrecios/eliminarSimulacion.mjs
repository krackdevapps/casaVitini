
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";
import { eliminarSimulacionPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/eliminarSimulacionPorSimulacionUID.mjs";

export const eliminarSimulacion = async (entrada) => {
    try {


        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El  simulacionUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
        await obtenerSimulacionPorSimulacionUID(simulacionUID)
        await eliminarSimulacionPorSimulacionUID(simulacionUID)

        const ok = {
            ok: "Se ha eliminado la simulación con éxito",
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}