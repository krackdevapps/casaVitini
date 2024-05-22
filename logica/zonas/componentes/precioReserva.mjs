import { precioReserva as precioReserva_ } from "../../sistema/precios/precioReserva.mjs";
import { validarObjetoReservaSoloFormato } from "../../sistema/reservas/validarObjetoReservaSoloFormato.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

export const precioReserva = async (entrada, salida) => {
    try {
        const tipoProcesadorPrecio = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoProcesadorPrecio,
            nombreCampo: "El campo del tipo de procesador de precio",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })
        const reserva = validadoresCompartidos.tipos.numero({
            number: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reser (reservaUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const rolActual = entrada.session.rol;
        if (tipoProcesadorPrecio !== "objeto" && tipoProcesadorPrecio !== "uid") {
            const error = "El campo 'tipoProcesadorPrecio' solo puede ser objeto o uid";
            throw new Error(error);
        }
        if (tipoProcesadorPrecio !== "objeto" && rolActual !== "administrador") {
            const error = "El componente precioReserva solo ofrece informacion de reserva por UID a cuentas con rol administrativo";
            throw new Error(error);
        }
        if (tipoProcesadorPrecio === "objeto") {
            await validarObjetoReservaSoloFormato(reserva);
        }
        const transaccion = {
            tipoProcesadorPrecio: tipoProcesadorPrecio,
            reserva: reserva
        }
        const transaccionInterna = await precioReserva_(transaccion);
        salida.json(transaccionInterna);
    } catch (errorCapturado) {
        throw errorCapturado
    }
}