export const anadirHabitacionAlApartamentoEnReserva = async (entrada, salida) => {
                const mutex = new Mutex();
                const bloqueoaAnadirHabitacionAlApartamentoEnReserva = await mutex.acquire();
                try {
                    let apartamento = entrada.body.apartamento;
                    const reserva = entrada.body.reserva;
                    const habitacion = entrada.body.habitacion;
                    if (typeof apartamento !== "number" || !Number.isInteger(apartamento) || apartamento <= 0) {
                        const error = "El campo 'apartamento' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const filtroCadena = /^[a-z0-9]+$/;
                    if (!filtroCadena.test(habitacion)) {
                        const error = "el campo 'habitacion' solo puede ser letras minúsculas y numeros.";
                        throw new Error(error);
                    }
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }

                    // Mira las habitaciones diponbiles para anadira este apartamento
                    const transaccionInterna = {
                        "apartamento": apartamento,
                        "reserva": reserva
                    };
                    const resuelveHabitaciones = await estadoHabitacionesApartamento(transaccionInterna);
                    const habitacionesResuelvas = resuelveHabitaciones.ok;
                    if (habitacionesResuelvas.length === 0) {
                        const error = `El apartamento no tiene disponibles mas habitaciones para ser anadidas en base a su configuracion glboal`;
                        throw new Error(error);
                    }
                    if (habitacionesResuelvas.length > 0) {
                        for (const habitacionResuelta of habitacionesResuelvas) {
                            if (habitacion === habitacionResuelta) {
                                const resolucionNombreHabitacion = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacion]);
                                if (resolucionNombreHabitacion.rowCount === 0) {
                                    const error = "No existe el identificador de la habitacionIDV";
                                    throw new Error(error);
                                }
                                const habitacionUI = resolucionNombreHabitacion.rows[0].habitacionUI;
                                const consultaInsertaHabitacion = `
                                    INSERT INTO "reservaHabitaciones"
                                    (
                                    apartamento,
                                    habitacion,
                                    "habitacionUI",
                                    reserva
                                    )
                                    VALUES ($1, $2, $3, $4) RETURNING uid
                                    `;
                                const resuelveInsercionHabitacion = await conexion.query(consultaInsertaHabitacion, [apartamento, habitacion, habitacionUI, reserva]);
                                if (resuelveInsercionHabitacion.rowCount === 1) {
                                    const ok = {
                                        "ok": `Se ha anadido la ${habitacionUI} al apartamento`,
                                        "nuevoUID": resuelveInsercionHabitacion.rows[0].uid
                                    };
                                    return salida.json(ok);
                                }
                            }
                        }
                        let error = {
                            "error": `No se puede anadir esta habitacion, revisa que este bien escrito los datos y que el apartamento tenga habitaciones disponibles`
                        };
                        salida.json(error);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                    bloqueoaAnadirHabitacionAlApartamentoEnReserva();
                }
            }