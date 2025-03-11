import { validadoresCompartidos } from "../../../validadores/validadoresCompartidos.mjs"
import { obtenerComplementoPorComplementoUID } from "../../../../infraestructure/repository/complementosDeAlojamiento/obtenerComplementoPorComplementoUID.mjs"

export const validarComplementosAlojamiento = async (reservaPublica) => {
    try {
        const complementosAlojamiento = reservaPublica.complementosAlojamiento || []
        const alojamiento = reservaPublica.alojamiento || {}

        for (const complementoSolicitado of complementosAlojamiento) {
            const complementoUI = complementoSolicitado.complementoUI
            const complementoUID = complementoSolicitado.complementoUID

            validadoresCompartidos.tipos.cadena({
                string: complementoUI,
                nombreCampo: "El campo complementoUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                limpiezaEspaciosInternos: "si"

            })

            const complementoUID_number = validadoresCompartidos.tipos.cadena({
                string: complementoUID,
                nombreCampo: `El campo complementoUID`,
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                impedirCero: "si",
                devuelveUnTipoNumber: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const complemento = await obtenerComplementoPorComplementoUID(complementoUID_number)

            const apartamentoIDV_delComportameinto = complemento?.apartamentoIDV
            if (!apartamentoIDV_delComportameinto) {
                const m = `Èl complemento de alojamiento ${complementoUI} con UID ${complementoUID} no existe.`
                throw new Error(m);
            }

            if (!alojamiento.hasOwnProperty(apartamentoIDV_delComportameinto)) {
                const m = `Èl complemento de alojamiento ${complementoUI} con UID ${complementoUID} no se puede procesar si no se solicia tambien el alojamiento al que va integrado, en este caso ${apartamentoIDV_delComportameinto}.`
                throw new Error(m);
            }

            const estadoIDV = complemento?.estadoIDV
            if (estadoIDV === "desactivado") {
                const m = `Èl complemento de alojamiento ${complementoUI} con UID ${complementoUID} ya no esta disponible.`
                throw new Error(m);
            }

        }
    } catch (error) {
        throw error
    }
}