
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

export const cancelarReserva = async (entrada, salida) => {
    try {
        const mensaje = "Función temporalmente deshabilitada."
        throw new Error(mensaje)

        const usuario = entrada.session.usuario;
        const reservaUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.reservaUID,
            nombreCampo: "El identificador universal de la reserva (reservaUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "no",
            devuelveUnTipoBigInt: "no"
        })
    } catch (errorCapturado) {
        throw errorCapturado
    }
}