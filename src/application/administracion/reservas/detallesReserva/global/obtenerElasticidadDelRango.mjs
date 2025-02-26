import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../../../shared/VitiniIDX/control.mjs";
import { validarModificacionRangoFechaResereva } from "../../../../../shared/reservas/validarModificacionRangoFechaResereva.mjs";
import { validadoresCompartidos } from "../../../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerReservaPorReservaUID } from "../../../../../infraestructure/repository/reservas/reserva/obtenerReservaPorReservaUID.mjs";

export const obtenerElasticidadDelRango = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 4
        })
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
            devuelveUnTipoNumber: "no"
        })
        const anoCalendario = validadoresCompartidos.tipos.cadena({
            string: entrada.body.anoCalendario,
            nombreCampo: "El campo anoCalendario",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no"
        })

        if (sentidoRango !== "pasado" && sentidoRango !== "futuro") {
            const error = "El campo 'sentidoRango' solo puede ser pasado o futuro";
            throw new Error(error);
        }
        validadoresCompartidos.fechas.cadenaMes(mesCalendario)
        validadoresCompartidos.fechas.cadenaAno(anoCalendario)

        const reserva = await obtenerReservaPorReservaUID(reservaUID)
        if (reserva.estadoReservaIDV === "cancelada") {
            const error = "La reserva no se puede modificar porque está cancelada.";
            throw new Error(error);
        }
        const transaccionInterna = await validarModificacionRangoFechaResereva({
            reservaUID: reservaUID,
            sentidoRango: sentidoRango,
            anoCalendario: anoCalendario,
            mesCalendario: mesCalendario
        })
        return transaccionInterna
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}