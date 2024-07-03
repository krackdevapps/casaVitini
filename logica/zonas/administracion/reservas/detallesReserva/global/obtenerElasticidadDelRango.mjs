import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../sistema/VitiniIDX/control.mjs";
import { validarModificacionRangoFechaResereva } from "../../../../../sistema/reservas/validarModificacionRangoFechaResereva.mjs";
import { validadoresCompartidos } from "../../../../../sistema/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const obtenerElasticidadDelRango = async (entrada, salida) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        mutex = new Mutex()
        await mutex.acquire()

        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const sentidoRango = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sentidoRango,
            nombreCampo: "El nombre de sentidoRango",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const mesCalendario = validadoresCompartidos.tipos.cadena({
            string: entrada.body.mesCalendario,
            nombreCampo: "El campo mesCalendario",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const anoCalendario = validadoresCompartidos.tipos.cadena({
            string: entrada.body.anoCalendario,
            nombreCampo: "El campo anoCalendario",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro";
            throw new Error(error);
        }
        validadoresCompartidos.fechas.cadenaMes(mesCalendario)
        validadoresCompartidos.fechas.cadenaAno(anoCalendario)

        const metadatos = {
            reserva: reserva,
            sentidoRango: sentidoRango,
            anoCalendario: anoCalendario,
            mesCalendario: mesCalendario
        };
        const reserva = await obtenerReservaPorReservaUID(reserva)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos);
        const ok = {
            ok: transaccionInterna
        };
        salida.json(transaccionInterna);
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}