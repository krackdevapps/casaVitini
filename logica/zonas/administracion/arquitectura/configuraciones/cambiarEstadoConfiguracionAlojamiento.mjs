export const cambiarEstadoConfiguracionAlojamiento = async (entrada, salida) => {
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        const nuevoEstado = entrada.body.nuevoEstado;
                        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                        if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                            const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin pesacios";
                            throw new Error(error);
                        }
                        if (!nuevoEstado || !filtroCadenaMinusculasSinEspacios.test(nuevoEstado)) {
                            const error = "el campo 'nuevoEstado' solo puede ser letras minúsculas, numeros y sin pesacios";
                            throw new Error(error);
                        }
                        const validarIDV = `
                                    SELECT 
                                    "estadoConfiguracion"
                                    FROM "configuracionApartamento"
                                    WHERE "apartamentoIDV" = $1
                                    `;
                        const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
                        if (resuelveValidarIDV.rowCount === 0) {
                            const error = "No existe el apartamento como entidad. Primero crea la entidad y luego podras crear la configuiracíon";
                            throw new Error(error);
                        }
                        const estadoConfiguracionActual = resuelveValidarIDV.rows[0].estadoConfiguracion;
                        const validarEstadoIDV = `
                                    SELECT 
                                    *
                                    FROM "estadoApartamentos"
                                    WHERE estado = $1
                                    `;
                        const resuelveValidarEstadoIDV = await conexion.query(validarEstadoIDV, [nuevoEstado]);
                        if (resuelveValidarEstadoIDV.rowCount === 0) {
                            const error = "Revisa el estado que has introducido por que no se conoce este estado para la configuracion del apartamento";
                            throw new Error(error);
                        }
                        if (nuevoEstado === "disponible") {
                            // Mirar que el apartamento tenga al menos una habitacion
                            const consultaHabitaciones = `
                                    SELECT 
                                    habitacion,
                                    uid
                                    FROM "configuracionHabitacionesDelApartamento"
                                    WHERE apartamento = $1
                                    `;
                            const resuelveConsultaHabitaciones = await conexion.query(consultaHabitaciones, [apartamentoIDV]);
                            if (resuelveConsultaHabitaciones.rowCount === 0) {
                                const error = "No se puede poner en disponible esta configuracíon por que no es valida. Necesitas al menos una habitacíon en esta configuracíon y este apartamento no la tiene";
                                throw new Error(error);
                            }
                            // Mirar que todas las habitaciones tengan una cama asignada
                            if (resuelveConsultaHabitaciones.rowCount > 0) {
                                const habitacionesSinCama = [];
                                const habitacionesEnConfiguracion = resuelveConsultaHabitaciones.rows;
                                for (const detalleHabitacion of habitacionesEnConfiguracion) {
                                    const habitacionUID = detalleHabitacion.uid;
                                    const habitacionIDV = detalleHabitacion.habitacion;
                                    const resolucionHabitacionUI = await conexion.query(`SELECT "habitacionUI" FROM habitaciones WHERE habitacion = $1`, [habitacionIDV]);
                                    if (resolucionHabitacionUI.rowCount === 0) {
                                        const error = "No existe el identificador de la habitacionIDV";
                                        throw new Error(error);
                                    }
                                    const habitacionUI = resolucionHabitacionUI.rows[0].habitacionUI;
                                    const selectorHabitacionAsignada = await conexion.query(`SELECT "cama" FROM "configuracionCamasEnHabitacion" WHERE habitacion = $1`, [habitacionUID]);
                                    if (selectorHabitacionAsignada.rowCount === 0) {
                                        habitacionesSinCama.push(habitacionUI);
                                    }
                                }
                                if (habitacionesSinCama.length > 0) {
                                    let funsionArray = habitacionesSinCama.join(", "); // Fusiona los elementos con comas
                                    funsionArray = funsionArray.replace(/,([^,]*)$/, ' y $1');
                                    const error = `No se puede establecer el estado disponible por que la configuracion no es valida. Por favor revisa las camas asignadas ne las habitaciones. En las habitaciones ${funsionArray} no hay una sola cama signada como opcion. Por favor asigna la camas`;
                                    throw new Error(error);
                                }
                            }
                            // Mira que tenga un perfil de precio creado y superiro 0
                            const consultaPerfilPrecio = await conexion.query(`SELECT precio FROM "preciosApartamentos" WHERE apartamento = $1`, [apartamentoIDV]);
                            if (consultaPerfilPrecio.rowCount === 0) {
                                const error = "La configuración no es válida. No se puede establecer en disponible por que esta configuración no tiene asignado un perfil de precio para poder calcular los impuestos. Por favor establece un perfil de precio para esta configuración.";
                                throw new Error(error);
                            }
                            if (consultaPerfilPrecio.rows[0].precio <= 0) {
                                const error = "El apartamento tiene una configuracion correcta y tambien tiene un perfil de precio pero en el perfil de precio hay establecido 0.00 como precio base y no esta permitido.";
                                throw new Error(error);
                            }
                            // No puede haber un estado disponible con precio base en 0.00
                        }
                        const actualizarEstadoConfiguracion = `
                                UPDATE "configuracionApartamento"
                                SET "estadoConfiguracion" = $1
                                WHERE "apartamentoIDV" = $2;
                                `;
                        const clienteActualizarEstadoConfiguracion = await conexion.query(actualizarEstadoConfiguracion, [nuevoEstado, apartamentoIDV]);
                        if (clienteActualizarEstadoConfiguracion.rowCount === 0) {
                            const error = "No se ha podido actualizar el estado de la configuracion del apartamento";
                            throw new Error(error);
                        }
                        if (clienteActualizarEstadoConfiguracion.rowCount === 1) {
                            const ok = {
                                ok: "Se ha actualizado el estado correctamente",
                                nuevoEstado: nuevoEstado
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