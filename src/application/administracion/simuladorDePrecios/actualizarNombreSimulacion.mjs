import { actualizarNombrePorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/actualizarNombrePorSimulacionUID.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { Mutex } from "async-mutex";

export const actualizarNombreSimulacion = async (entrada) => {
    const mutex = new Mutex()
    try {



        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })

        const nombre = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombre,
            nombreCampo: "El campo del nombre de la simulación",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            filtro: "strictoIDV",
            nombreCampo: "El campo simulacionUID",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        mutex.acquire()
        await actualizarNombrePorSimulacionUID({
            simulacionUID,
            nombre
        })
        const ok = {
            ok: "Se ha actualizado el nombre",
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}