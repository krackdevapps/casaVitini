import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { actualizarParConfiguracion } from "../../../../infraestructure/repository/configuracion/parConfiguracion/actualizarParConfiguracion.mjs";

export const guardarConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
        })
        const diasAntelacionReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.diasAntelacionReserva,
            nombreCampo: "El campo diasAntelacionReserva",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            impedirCero: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const limiteFuturoReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.limiteFuturoReserva,
            nombreCampo: "El campo limiteFuturoReserva",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            impedirCero: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const diasMaximosReserva = validadoresCompartidos.tipos.cadena({
            string: entrada.body.diasMaximosReserva,
            nombreCampo: "El campo diasMaximosReserva",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const horaLimiteDelMismoDia = entrada.body?.horaLimiteDelMismoDia || ""
        if (horaLimiteDelMismoDia.length > 0) {
            validadoresCompartidos.tipos.horas({
                hora: horaLimiteDelMismoDia || "",
                nombreCampo: "El campo horaLimiteDelMismoDia",
            })
        }
        if (diasAntelacionReserva === 0 && horaLimiteDelMismoDia.length === 0) {
            const error = "Por favor, si especificas 0 días de antelación y permites reservas el mismo día, determina una hora límite para hacer la reserva el mismo día.";
            throw new Error(error);
        }


        if (Number(diasAntelacionReserva) >= Number(limiteFuturoReserva)) {
            const error = "Los días de antelación no pueden ser iguales o superiores a los días del limiteFuturoReserva porque entonces no se permiten reservas de más de 0 días";
            throw new Error(error);
        }
        if (0 === Number(limiteFuturoReserva)) {
            const error = "El límite futuro no puede ser de 0, porque entonces no se permiten reservas de más de 0 días.";
            throw new Error(error);
        }
        if (0 === Number(diasMaximosReserva)) {
            const error = "No puedes determinar que el número máximo de días de las reservas públicas sea de 0.";
            throw new Error(error);
        }
        const maximoDiasDuracionReserva = Number(limiteFuturoReserva) - Number(diasAntelacionReserva);
        if (Number(diasMaximosReserva) > Number(maximoDiasDuracionReserva)) {
            const error = `En base la configuración que solicitas, es decir, en base a los días mínimos de antelación establecidos y el límite futuro de días, las reservas tendrían un máximo de ${maximoDiasDuracionReserva} días de duración, por lo tanto, no puedes establecer más días de duración que eso. Es decir, o escoges poner menos días de duración máximo para una reserva o ampliar los límites anteriores.`;
            throw new Error(error);
        }
        await campoDeTransaccion("iniciar")
        const dataActualizarParConfiguracion = {
            diasAntelacionReserva: diasAntelacionReserva,
            diasMaximosReserva: diasMaximosReserva,
            limiteFuturoReserva: limiteFuturoReserva,
            horaLimiteDelMismoDia: horaLimiteDelMismoDia
        }
        await actualizarParConfiguracion(dataActualizarParConfiguracion)

        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha actualizado correctamente la configuración"
        };
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    }

}