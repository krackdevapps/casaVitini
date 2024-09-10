import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { Mutex } from "async-mutex";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { actualizarZonaIDVDeLaConfiguracion } from "../../../../repositorio/arquitectura/configuraciones/actualizarZonaIDVDeLaConfiguracion.mjs";

export const actualizarZonaDeLaConfiguracionApartamento = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        mutex.acquire()

        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El apartamentoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nuevaZona = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nuevaZona,
            nombreCampo: "El nuevaZona",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (nuevaZona !== "publica" && nuevaZona !== "privada" && nuevaZona !== "global") {
            const m = "El campo nuevaZona solo espera, publica, privada o global"
            throw new Error(m)
        }
        await obtenerConfiguracionPorApartamentoIDV({
            apartamentoIDV,
            errorSi: "noExiste"
        })
        await actualizarZonaIDVDeLaConfiguracion({
            apartamentoIDV,
            nuevaZona
        })
        const ok = {
            ok: "Se ha actualizado la zona de la configuración de alojamiento.",
            apartamentoIDV,
            nuevaZona
        };
        return ok

    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}