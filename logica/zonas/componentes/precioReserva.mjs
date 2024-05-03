import { validarObjetoReservaSoloFormato } from "../../sistema/sistemaDeReservas/validarObjetoReservaSoloFormato.mjs";

export const precioReserva = async (entrada, salida) => {
    try {
        const tipoProcesadorPrecio = entrada.body.tipoProcesadorPrecio;
        const reserva = entrada.body.reserva;
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
        const transaccionInterna = await precioReserva(transaccion);
        salida.json(transaccionInterna);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        }
        salida.json(error);
    }
}