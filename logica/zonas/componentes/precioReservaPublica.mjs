import { precioReserva } from "../../sistema/precios/precioReserva.mjs";
import { procesadorPrecio } from "../../sistema/precios/procesdadorPrecio.mjs";
import { validarObjetoReservaSoloFormato } from "../../sistema/reservas/validarObjetoReservaSoloFormato.mjs";

export const precioReservaPublica = async (entrada, salida) => {
    try {

        const reservaObjeto = entrada.body.reservaObjeto
        await validarObjetoReservaSoloFormato({
            reservaObjeto,
            filtroTitular: "no",
            filtroHabitacionesCamas: "no"
        });
        const transaccion = {
            tipoProcesadorPrecio: tipoProcesadorPrecio,
            reserva: reserva
        }


        const desgloseFinanciero = await procesadorPrecio({
            fechaEntrad: null,
            fechaSalida: null,
            apartamentosArray: null,
            capaImpuesto: "si",
            capaOfertas: "si",
            capaDescuntosPersonlizados: "no",
            
        })

        const transaccionInterna = await precioReserva(transaccion);
        salida.json(desgloseFinanciero);
    } catch (errorCapturado) {
        throw errorCapturado
    }
}