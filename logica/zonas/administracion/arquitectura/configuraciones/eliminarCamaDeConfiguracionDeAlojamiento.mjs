export const eliminarCamaDeConfiguracionDeAlojamiento = async (entrada, salida) => {
                    try {
                        const camaUID = entrada.body.camaUID;
                        if (!camaUID || !Number.isInteger(camaUID) || camaUID < 0) {
                            const error = "el campo 'camaUID' solo puede ser numeros";
                            throw new Error(error);
                        }
                        const validarHabitacionUID = `
                                    SELECT 
                                    habitacion
                                    FROM "configuracionCamasEnHabitacion"
                                    WHERE uid = $1
                                    `;
                        const resuelveValidarHabitacionUID = await conexion.query(validarHabitacionUID, [camaUID]);
                        if (resuelveValidarHabitacionUID.rowCount === 0) {
                            const error = "No existe la cama, revisa el camaUID";
                            throw new Error(error);
                        }
                        const habitacionUID = resuelveValidarHabitacionUID.rows[0].habitacion;
                        const consultaIntermediaEscaleraHaciaArriba = `
                                SELECT 
                                apartamento
                                FROM "configuracionHabitacionesDelApartamento"
                                WHERE uid = $1;
                                `;
                        const resuelveConsultaIntermediaEscaleraHaciaArriba = await conexion.query(consultaIntermediaEscaleraHaciaArriba, [habitacionUID]);
                        const apartamentoIDV = resuelveConsultaIntermediaEscaleraHaciaArriba.rows[0].apartamento;
                        const consultaApartamento = `
                                SELECT 
                                "estadoConfiguracion"
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;
                                `;
                        const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
                        if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                            const error = "No se puede eliminar una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
                            throw new Error(error);
                        }
                        const eliminarCama = `
                                    DELETE FROM "configuracionCamasEnHabitacion"
                                    WHERE uid = $1;
                                    `;
                        const resuelveEliminarCama = await conexion.query(eliminarCama, [camaUID]);
                        if (resuelveEliminarCama.rowCount === 0) {
                            const error = "No se ha eliminado la cama por que no se ha entcontrado el registro en la base de datos";
                            throw new Error(error);
                        }
                        if (resuelveEliminarCama.rowCount === 1) {
                            const ok = {
                                "ok": "Se ha eliminado correctamente la cama de la habitacion",
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