export const estadoHabitacionesApartamento = async (entrada, salida) => {
                try {
                    const apartamento = entrada.body.apartamento;
                    const reserva = entrada.body.reserva;
                    if (typeof apartamento !== "number" || !Number.isInteger(apartamento) || apartamento <= 0) {
                        const error = "El campo 'apartamento' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const transaccionInterna = {
                        apartamento: apartamento,
                        reserva: reserva
                    };
                    const resuelveHabitaciones = await estadoHabitacionesApartamento(transaccionInterna);
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