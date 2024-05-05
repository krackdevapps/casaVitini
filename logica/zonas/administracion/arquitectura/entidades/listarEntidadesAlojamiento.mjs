
import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const listarEntidadesAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return


        const estructuraFinal = {};
        const consultaApartamento = `
                                SELECT
                                apartamento,
                                "apartamentoUI"
                                FROM apartamentos
                                ;`;
        const resuleveConsultaApartamento = await conexion.query(consultaApartamento);
        if (resuleveConsultaApartamento.rowCount > 0) {
            const apartamentoEntidad = resuleveConsultaApartamento.rows;
            estructuraFinal.apartamentos = apartamentoEntidad;
        }
        const consultaHabitaciones = `
                                SELECT
                                habitacion,
                                "habitacionUI"
                                FROM habitaciones
                                ;`;
        const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones);
        if (resuelveConsultaHabitaciones.rowCount > 0) {
            const habitacionEntidad = resuelveConsultaHabitaciones.rows;
            estructuraFinal.habitaciones = habitacionEntidad;
        }
        const consultaCamas = `
                                SELECT
                                cama,
                                "camaUI"
                                FROM camas
                                ;`;
        const resuelveConsultaCamas = await conexion.query(consultaCamas);
        if (resuelveConsultaCamas.rowCount > 0) {
            const camaEntidades = resuelveConsultaCamas.rows;
            estructuraFinal.camas = camaEntidades;
        }
        const ok = {
            "ok": estructuraFinal
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}