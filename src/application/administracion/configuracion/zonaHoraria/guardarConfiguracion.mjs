import { listaZonasHorarias } from "../../../../shared/zonasHorarias.mjs";

import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { actualizarParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/actualizarParConfiguracion.mjs";


export const guardarConfiguracion = async (entrada, salida) => {
    try {

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })
        const zonaHoraria = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zonaHoraria,
            nombreCampo: "El campo del zonaHoraria",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (!listaZonasHorarias.includes(zonaHoraria)) {
            const error = "El código de la zona horaria no existe.";
            throw new Error(error);
        }

        await actualizarParConfiguracion({
            zonaHoraria: zonaHoraria
        })

        const ok = {
            ok: "Se ha actualizado correctamente la configuración"
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}