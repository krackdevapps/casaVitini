import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerPerfilPrecioPorApartamentoUID } from "../../../../repositorio/precios/obtenerPerfilPrecioPorApartamentoUID.mjs";
import { Mutex } from "async-mutex";
import { obtenerHabitacionComoEntidadPorHabitacionIDV } from "../../../../repositorio/arquitectura/entidades/habitacion/obtenerHabitacionComoEntidadPorHabitacionIDV.mjs";
import { obtenerHabitacionesDelApartamentoPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerHabitacionesDelApartamentoPorApartamentoIDV.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerCamasDeLaHabitacionPorHabitacionUID } from "../../../../repositorio/arquitectura/configuraciones/obtenerCamasDeLaHabitacionPorHabitacionUID.mjs";
import { actualizarEstadoPorApartamentoIDV } from "../../../../repositorio/arquitectura/configuraciones/actualizarEstadoPorApartamentoIDV.mjs";
import { actualizarZonaIDVDeLaConfiguracion } from "../../../../repositorio/arquitectura/configuraciones/actualizarZonaIDVDeLaConfiguracion.mjs";

export const actualizarZonaDeLaConfiguracionApartamento = async (entrada, salida) => {
    const mutex = new Mutex()
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

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
            const m = "El campo nueva zona solo espera, publica, privadao o global"
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
            ok: "Se ha actualizado la zona de la configuracion de alojamiento",
            apartamentoIDV,
            nuevaZona
        };
        salida.json(ok)

    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}