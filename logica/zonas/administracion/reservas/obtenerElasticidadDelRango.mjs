import { Mutex } from "async-mutex";
import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validarModificacionRangoFechaResereva } from "../../../sistema/reservas/validarModificacionRangoFechaResereva.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const obtenerElasticidadDelRango = async (entrada, salida) => {
    let mutex
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        mutex = new Mutex()
        await mutex.acquire()

        const reserva = validadoresCompartidos.tipos.numero({
            string: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reserva ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
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
        const regexMes = /^\d{2}$/;
        const regexAno = /^\d{4,}$/;
        if (!regexAno.test(anoCalendario)) {
            const error = "El año (anoCalenadrio) debe de ser una cadena de cuatro digitos. Por ejemplo el año uno se escribiria 0001";
            throw new Error(error);
        }
        if (!regexMes.test(mesCalendario)) {
            const error = "El mes (mesCalendario) debe de ser una cadena de dos digitos, por ejemplo el mes de enero se escribe 01";
            throw new Error(error);
        }
        const mesNumeroControl = parseInt(mesCalendario, 10);
        const anoNumeroControl = parseInt(anoCalendario, 10);
        if (mesNumeroControl < 1 && mesNumeroControl > 12 && anoNumeroControl < 2000) {
            const error = "Revisa los datos de mes por que debe de ser un numero del 1 al 12";
            throw new Error(error);
        }
        if (anoNumeroControl < 2000 || anoNumeroControl > 5000) {
            const error = "El año no puede ser inferior a 2000 ni superior a 5000";
            throw new Error(error);
        }
        const metadatos = {
            reserva: reserva,
            sentidoRango: sentidoRango,
            anoCalendario: anoCalendario,
            mesCalendario: mesCalendario
        };
        const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
        const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
        if (resuelveValidacionReserva.rowCount === 0) {
            const error = "No existe la reserva";
            throw new Error(error);
        }
        if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
            const error = "La reserva no se puede modificar por que esta cancelada";
            throw new Error(error);
        }
        const transaccionInterna = await validarModificacionRangoFechaResereva(metadatos);
        const ok = {
            ok: transaccionInterna
        };
        salida.json(transaccionInterna);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}