import { validadoresCompartidos } from "../../validadores/validadoresCompartidos.mjs"

export const validadorBusqueda = (configuracion) => {
    try {
        const pagina = validadoresCompartidos.tipos.numero({
            number: configuracion.pagina || 1,
            nombreCampo: "El numero de página aqui",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const nombreColumna = validadoresCompartidos.tipos.cadena({
            string: configuracion.nombreColumna,
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: configuracion.sentidoColumna,
            nombreCampo: "El campo del sentido de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)
    } catch (error) {
        throw error
    }
}