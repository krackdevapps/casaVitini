import { conexion } from "../../../componentes/db.mjs";
import { crearReenbolso } from "../../../componentes/pasarelas/square/crearReenbolso.mjs";
import { detallesDelPago as detallesDelPago_ } from "../../../componentes/pasarelas/square/detallesDelPago.mjs";
import { obtenerReservaPorReservaUID } from "../../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { campoDeTransaccion } from "../../../repositorio/globales/campoDeTransaccion.mjs";

export const cancelarReserva = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.control()

        const usuario = entrada.session.usuario;
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const mensaje = {
            error: "Función temporalmente deshabilitada."
        }
        throw new Error(mensaje)
      
    } catch (errorCapturado) {
        throw errorFinal
    }
}