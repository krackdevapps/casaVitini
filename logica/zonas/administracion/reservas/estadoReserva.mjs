import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const estadoReserva = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const reserva = validadoresCompartidos.tipos.numero({
            string: entrada.body.reserva,
            nombreCampo: "El identificador universal de la reserva",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const consultaEstadoReservas = `
                        SELECT 
                        reserva,
                        "estadoPago",
                        "estadoReserva"
                        FROM reservas 
                        WHERE reserva = $1;`;
        const resuelveConsultaEstadoReservas = await conexion.query(consultaEstadoReservas, [reserva]);
        if (resuelveConsultaEstadoReservas.rowCount === 0) {
            const error = "No existe al reserva";
            throw new Error(error);
        }
        if (resuelveConsultaEstadoReservas.rowCount === 1) {
            const ok = {
                "estadoReserva": resuelveConsultaEstadoReservas.rows[0].estadoReserva,
                "estadoPago": resuelveConsultaEstadoReservas.rows[0].estadoPago
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
    }
}