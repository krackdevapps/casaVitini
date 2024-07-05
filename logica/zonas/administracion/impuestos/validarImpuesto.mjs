import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs"
export const validarImpuesto = (impuesto) => {
    try {
        validadoresCompartidos.tipos.cadena({
            string: impuesto.nombre,
            nombreCampo: "El nombre del impuesto",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        validadoresCompartidos.tipos.cadena({
            string: impuesto.tipoImpositivo,
            nombreCampo: "El tipo tipoImpositivo",
            filtro: "cadenaConNumerosConDosDecimales",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const tipoValorIDV = validadoresCompartidos.tipos.cadena({
            string: impuesto.tipoValorIDV,
            nombreCampo: "El tipo tipoValorIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        if (tipoValorIDV !== "porcentaje" && tipoValorIDV === "tasa") {
            const m = "tipoValorIDV solo espera porcentaje o taja"
            throw new Error(m)
        }
        validadoresCompartidos.tipos.cadena({
            string: impuesto.entidadIDV,
            nombreCampo: "El tipo entidadIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        validadoresCompartidos.tipos.cadena({
            string: impuesto.estadoIDV || "",
            nombreCampo: "El tipo estadoIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        return impuesto
    } catch (error) {
        throw error
    }

}