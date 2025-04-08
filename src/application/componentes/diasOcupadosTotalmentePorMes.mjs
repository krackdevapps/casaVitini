import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../shared/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../shared/validadores/validadoresCompartidos.mjs";
import { diasOcupadosTotalmentePorMes_ComponenteCompartido } from "../../shared/componentess/diasOcupadosTotalmentePorMes_ComponenteCompartido.mjs";

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
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const anoActual = tiempoZH.year;
        const mesActual = tiempoZH.month;

        if (anoActual > ano) {
            const error = "Este componente solo proporciona información de fechas anteriores a la actual con una cuenta de tipo Administrador o Empleado.";
            throw new Error(error);
        } else if (anoActual === ano && mesActual > mes) {
            const error = "Este componente solo proporciona información de fechas anteriores a la actual con una cuenta de tipo Administrador o Empleado.";
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