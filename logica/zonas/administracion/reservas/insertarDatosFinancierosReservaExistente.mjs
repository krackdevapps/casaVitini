import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { insertarTotalesReserva } from "../../../sistema/sistemaDeReservas/insertarTotalesReserva.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { detallesReserva } from "./detallesReserva.mjs";

export const insertarDatosFinancierosReservaExistente = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const reserva = validadoresCompartidos.tipos.numero({
            string: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reserva ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const transaccionPrecioReserva = {
            tipoProcesadorPrecio: "uid",
            reservaUID: reserva
        };
        const resuelvePrecioReserva = await insertarTotalesReserva(transaccionPrecioReserva);
        const metadatosDetallesReserva = {
            reservaUID: reserva
        };
        const reseuvleDetallesReserva = await detallesReserva(metadatosDetallesReserva);
        const respuesta = {
            ok: resuelvePrecioReserva,
            desgloseFinanciero: reseuvleDetallesReserva.desgloseFinanciero
        };
        salida.json(respuesta);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}