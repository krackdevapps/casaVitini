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

        const diasAntelacionReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.diasAntelacionReserva,
            nombreCampo: "El campo diasAntelacionReserva",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const limiteFuturoReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.limiteFuturoReserva,
            nombreCampo: "El campo limiteFuturoReserva",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const diasMaximosReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.diasMaximosReserva,
            nombreCampo: "El campo diasMaximosReserva",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (Number(diasAntelacionReserva) >= Number(limiteFuturoReserva)) {
            const error = "Los dias de antelacion no pueden ser iguales o superiores a los dias del limiteFuturoReserva por que entonces no se permiten reservas de mas de 0 dias";
            throw new Error(error);
        }
        if (0 === Number(limiteFuturoReserva)) {
            const error = "El limite futuro no puede ser de 0, por que entonces no se permite reservas de mas de 0 dias.";
            throw new Error(error);
        }
        if (0 === Number(diasMaximosReserva)) {
            const error = "No puedes determinar que el numero maximo de días de las reservas públicas sea de 0.";
            throw new Error(error);
        }
        const maximoDiasDuracionReserva = Number(limiteFuturoReserva) - Number(diasAntelacionReserva);
        if (Number(diasMaximosReserva) > Number(maximoDiasDuracionReserva)) {
            const error = `En base la configuracíon que solicitas, es decir en base a los dias minimos de antelación establecidos y el limite futuro de dias, las reservas tendrian un maximo de ${maximoDiasDuracionReserva} días de duracíon, por lo tanto no puedes establecer mas días de duracíon que eso. Es decir o escoges poner menos dias de duración maximo para una reserva o ampliar los limites anteriores.`;
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")
        const dataActualizarParConfiguracion = {
            "diasAntelacionReserva": diasAntelacionReserva,
            "limiteFuturoReserva": limiteFuturoReserva,
            "diasMaximosReserva": diasMaximosReserva
        }
        await actualizarParConfiguracion(dataActualizarParConfiguracion)

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