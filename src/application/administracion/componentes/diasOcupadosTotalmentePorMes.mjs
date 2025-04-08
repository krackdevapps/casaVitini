import { diasOcupadosTotalmentePorMes_ComponenteCompartido } from "../../../shared/componentess/diasOcupadosTotalmentePorMes_ComponenteCompartido.mjs"
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs"

export const diasOcupadosTotalmentePorMes = async (entrada) => {
    try {
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 2
        })
        const ano = validadoresCompartidos.tipos.numero({
            number: entrada.body.ano,
            nombreCampo: "El campo del año",
            sePermiteVacio: "no",
            filtro: "numeroSimple",
            limpiezaEspaciosAlrededor: "si",
        })
        const mes = validadoresCompartidos.tipos.numero({
            number: entrada.body.mes,
            nombreCampo: "El campo del mes",
            sePermiteVacio: "no",
            filtro: "numeroSimple",
            limpiezaEspaciosAlrededor: "si",
        })
        validadoresCompartidos.fechas.cadenaMes
        if (mes < 0 || mes > 12) {
            const error = "El campo 'mes' solo puede ser un número entero y positivo entre el 1 y el 12";
            throw new Error(error);
        }
        if (ano < 0) {
            const error = "El campo año solo puede ser un número entero y positivo y superior a 0";
            throw new Error(error);
        }
        const dOTPM = await diasOcupadosTotalmentePorMes_ComponenteCompartido({
            mes,
            ano
        })
        const objetofinal = {
            ok: dOTPM
        };

        return objetofinal
    } catch (errorCapturado) {
        throw errorCapturado
    }
}