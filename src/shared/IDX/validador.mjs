import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"

export const validador = (data) => {
    try {
        const usuario = data.usuario
        const clave = data.clave

        validadoresCompartidos.tipos.cadena({
            string: usuario,
            nombreCampo: "El nombre de usuario (VitiniIDX)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        if (typeof clave !== "string") {
            const m = "Se espera que el campo clave sea una cadena"
            throw new Error(m)
        }
        if (clave.length === 0 || !clave) {
            const m = "Falta especificar la clave"
            throw new Error(m)
        }
        if (clave.length > 70) {
            const m = "No se espera una clave superior a 70 caracteres"
            throw new Error(m)
        }
    } catch (error) {
        throw error
    }
}