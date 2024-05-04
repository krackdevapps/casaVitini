import { resolverApartamentoUI } from "../../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";
import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const detalleConfiguracionAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return


        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
            const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios";
            throw new Error(error);
        }
        const consultaPerfilConfiguracion = `
                                SELECT 
                                uid,
                                "apartamentoIDV",
                                "estadoConfiguracion",
                                imagen
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;
                                `;
        const resuelveConsultaPerfilConfiguracion = await conexion.query(consultaPerfilConfiguracion, [apartamentoIDV]);
        if (resuelveConsultaPerfilConfiguracion.rowCount === 0) {
            const error = "No hay ninguna configuracion disponible para este apartamento";
            throw new Error(error);
        }
        if (resuelveConsultaPerfilConfiguracion.rowCount > 0) {
            const estadoConfiguracion = resuelveConsultaPerfilConfiguracion.rows[0].estadoConfiguracion;
            const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
            const consultaHabitaciones = `
                                    SELECT 
                                    uid,
                                    apartamento,
                                    habitacion
                                    FROM "configuracionHabitacionesDelApartamento"
                                    WHERE apartamento = $1;
                                    `;
            const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [apartamentoIDV]);
            const habitacionesEncontradas = resuelveConsultaHabitaciones.rows;
            for (const detalleHabitacion of habitacionesEncontradas) {
                const uidHabitacion = detalleHabitacion.uid;
                const apartamentoIDV = detalleHabitacion.apartamento;
                const habitacionIDV = detalleHabitacion.habitacion;
                const resolucionNombreHabitacion = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV]);
                if (resolucionNombreHabitacion.rowCount === 0) {
                    const error = "No existe el identificador de la habitacionIDV";
                    throw new Error(error);
                }
                const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI;
                detalleHabitacion.habitacionUI = habitacionUI;
                const consultaCamas = `
                                        SELECT
                                        uid,
                                        habitacion, 
                                        cama
                                        FROM
                                        "configuracionCamasEnHabitacion"
                                        WHERE
                                        habitacion = $1
                                        `;
                const resolverConsultaCamas = await conexion.query(consultaCamas, [uidHabitacion]);
                detalleHabitacion.camas = [];
                if (resolverConsultaCamas.rowCount > 0) {
                    const camasEntontradas = resolverConsultaCamas.rows;
                    for (const detallesCama of camasEntontradas) {
                        const uidCama = detallesCama.uid;
                        const camaIDV = detallesCama.cama;
                        const resolucionNombreCama = await conexion.query(`SELECT "camaUI", capacidad FROM camas WHERE cama = $1`, [camaIDV]);
                        if (resolucionNombreCama.rowCount === 0) {
                            const error = "No existe el identificador de la camaIDV";
                            throw new Error(error);
                        }
                        const camaUI = resolucionNombreCama.rows[0].camaUI;
                        const capacidad = resolucionNombreCama.rows[0].capacidad;
                        const estructuraCama = {
                            uid: uidCama,
                            camaIDV: camaIDV,
                            camaUI: camaUI,
                            capacidad: capacidad
                        };
                        detalleHabitacion.camas.push(estructuraCama);
                    }
                }
            }
            const ok = {
                ok: habitacionesEncontradas,
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI,
                estadoConfiguracion: estadoConfiguracion,
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