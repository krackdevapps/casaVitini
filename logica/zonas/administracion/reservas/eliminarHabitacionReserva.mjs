export const eliminarHabitacionReserva = async (entrada, salida) => {
                const mutex = new Mutex();
                const bloqueoEliminarHabitacionReserva = await mutex.acquire();
                try {
                    let reserva = entrada.body.reserva;
                    // apartamentoUID
                    let habitacion = entrada.body.habitacion;
                    let pernoctantes = entrada.body.pernoctantes;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof habitacion !== "number" || !Number.isInteger(habitacion) || habitacion <= 0) {
                        const error = "el campo 'habitacion' solo puede un numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (pernoctantes !== "conservar" && pernoctantes !== "eliminar") {
                        const error = "El campo 'pernoctantes' solo puede ser 'conservar', 'mantener'";
                        throw new Error(error);
                    }
                    // Comprobar que la reserva exisste
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    let resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoPago === "pagado") {
                        const error = "La reserva no se puede modificar por que esta pagada";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoPago === "reembolsado") {
                        const error = "La reserva no se puede modificar por que esta reembolsada";
                        throw new Error(error);
                    }
                    // validar habitacion
                    const validacionHabitacion = `
                        SELECT 
                        uid
                        FROM "reservaHabitaciones"
                        WHERE reserva = $1 AND uid = $2
                        `;
                    let resuelveValidacionHabitacion = await conexion.query(validacionHabitacion, [reserva, habitacion]);
                    if (resuelveValidacionHabitacion.rowCount === 0) {
                        const error = "No existe la habitacion dentro de la reserva";
                        throw new Error(error);
                    }
                    let ok;
                    if (pernoctantes === "eliminar") {
                        let eliminarPernoctantes = `
                            DELETE FROM "reservaPernoctantes"
                            WHERE habitacion = $1 AND reserva = $2;
                            `;
                        let resuelveEliminarPernoctantes = await conexion.query(eliminarPernoctantes, [habitacion, reserva]);
                        ok = {
                            "ok": "Se ha eliminado al habitacion correctamente y los pernoctanes que contenia"
                        };
                    }
                    let eliminaHabitacionReserva = `
                        DELETE FROM "reservaHabitaciones"
                        WHERE uid = $1 AND reserva = $2;
                        `;
                    let resuelveEliminaHabitacionReserva = await conexion.query(eliminaHabitacionReserva, [habitacion, reserva]);
                    if (pernoctantes === "conservar") {
                        let desasignaPernoctanteDeHabitacion = `
                            UPDATE "reservaPernoctantes"
                            SET habitacion = NULL
                            WHERE reserva = $1 AND habitacion = $2;
                            `;
                        await conexion.query(desasignaPernoctanteDeHabitacion, [reserva, habitacion]);
                        ok = {
                            "ok": "Se ha eliminado al habitacion correctamente pero los pernoctantes que contenia siguen asignados a la reserva"
                        };
                    }
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                    bloqueoEliminarHabitacionReserva();
                }
            }