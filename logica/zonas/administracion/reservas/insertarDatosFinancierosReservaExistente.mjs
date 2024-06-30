import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { detallesReserva } from "./detallesReserva.mjs";


export const insertarDatosFinancierosReservaExistente = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const reserva = validadoresCompartidos.tipos.numero({
            number: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reserva ",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })


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
        throw errorCapturado
    }
}