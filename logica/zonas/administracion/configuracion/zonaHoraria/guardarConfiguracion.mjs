import { listaZonasHorarias } from "../../../../componentes/zonasHorarias.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

import { actualizarParConfiguracion } from "../../../../repositorio/configuracion/actualizarParConfiguracion.mjs";
import { campoDeTransaccion } from "../../../../repositorio/globales/campoDeTransaccion.mjs";

export const guardarConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const zonaHoraria = validadoresCompartidos.tipos.cadena({
            string: entrada.body.zonaHoraria,
            nombreCampo: "El campo del zonaHoraria",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })


        // Validar que la zona horarai exista
        const validarZonaHoraria = (zonaHorariaAValidar) => {
            let resultadoFinal = "no";
            for (const zonaHoraria of listaZonasHorarias) {
                if (zonaHoraria === zonaHorariaAValidar) {
                    resultadoFinal = "si";
                }
            }
            return resultadoFinal;
        };
        if (validarZonaHoraria(zonaHoraria) === "no") {
            const error = "el campo 'zonaHorariaGlobal' no existe";
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")
        const paresConf = {
            "zonaHoraria": zonaHoraria
        }
        await actualizarParConfiguracion(paresConf)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente la configuracion"
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorFinal
    }
}