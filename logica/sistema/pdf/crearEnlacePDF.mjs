import { campoDeTransaccion } from "../../repositorio/globales/campoDeTransaccion.mjs";
import { eliminarEnlacesPDFPorReservaUID } from "../../repositorio/pdf/eliminarEnlacesPDFPorReservaUID.mjs";
import { insertarEnlacePDF } from "../../repositorio/pdf/insertarEnlacePDF.mjs";
import { obtenerReservaPorReservaUID } from "../../repositorio/reservas/reserva/obtenerReservaPorReservaUID.mjs";
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs";
import { controlCaducidad } from "./controlCaducidad.mjs";

export const crearEnlacePDF = async (reservaUID) => {
    try {
        await campoDeTransaccion("iniciar")
        
        await obtenerReservaPorReservaUID(reservaUID)
        await controlCaducidad();
        const generarCadenaAleatoria = (longitud) => {
            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let cadenaAleatoria = '';
            for (let i = 0; i < longitud; i++) {
                const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                cadenaAleatoria += caracteres.charAt(indiceAleatorio);
            }
            return cadenaAleatoria;
        };
        const fechaActual = DateTime.utc();
        const fechaFutura = fechaActual.plus({ days: 2 });
        const fechaCaducidad = fechaFutura.toISO();
        // Ver si existe el enlace se borra
        await eliminarEnlacesPDFPorReservaUID(reservaUID)

        const nuevoEnlace = await insertarEnlacePDF({
            reservaUID: reservaUID,
            enlaceUPID: generarCadenaAleatoria(100),
            fechaCaducidad: fechaCaducidad,
        })
        const enlacePDF = nuevoEnlace.enlace;
        await campoDeTransaccion("confirmar")
        return enlacePDF;
    } catch (error) {
        await campoDeTransaccion("cancelar")
        throw error;
    }
}