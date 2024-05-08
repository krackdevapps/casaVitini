import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { estadoHabitacionesApartamento as estadoHabitacionesApartamento_ } from "../../../sistema/sistemaDeReservas/estadoHabitacionesApartamento.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";


export const estadoHabitacionesApartamento = async (entrada, salida) => {
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

        const apartamento = validadoresCompartidos.tipos.numero({
            string: entrada.body.apartamento,
            nombreCampo: "El identificador universal dlapartamento",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        const transaccionInterna = {
            apartamento: apartamento,
            reserva: reserva
        };
        const resuelveHabitaciones = await estadoHabitacionesApartamento_(transaccionInterna);
        if (resuelveHabitaciones.info) {
            return salida.json(resuelveHabitaciones);
        }
        const habitacionesResuelvas = resuelveHabitaciones.ok;
        if (habitacionesResuelvas.length === 0) {
            const ok = {
                ok: []
            };
            salida.json(ok);
        }
        if (habitacionesResuelvas.length > 0) {
            const habitacionesProcesdas = [];
            for (const habitacionPreProcesada of habitacionesResuelvas) {
                const consultaHabitacion = `
                                SELECT habitacion, "habitacionUI"
                                FROM habitaciones
                                WHERE habitacion = $1
                                `;
                const resuelveHabitacion = await conexion.query(consultaHabitacion, [habitacionPreProcesada]);
                const habitacionIDV = resuelveHabitacion.rows[0].habitacion;
                const habitaconUI = resuelveHabitacion.rows[0].habitacionUI;
                const habitacionResuelta = {
                    habitacionIDV: habitacionIDV,
                    habitacionUI: habitaconUI
                };
                habitacionesProcesdas.push(habitacionResuelta);
            }
            const ok = {
                ok: habitacionesProcesdas
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}