export const listarConfiguracionApartamentos = async (entrada, salida) => {
                    try {
                        const seleccionaApartamentos = `
                                    SELECT 
                                    uid,
                                    "apartamentoIDV",
                                    "estadoConfiguracion"
                                    FROM "configuracionApartamento"
                                    `;
                        const resuelveSeleccionaApartamentos = await conexion.query(seleccionaApartamentos);
                        const apartamentosConConfiguracion = [];
                        if (resuelveSeleccionaApartamentos.rowCount > 0) {
                            const apartamentoEntidad = resuelveSeleccionaApartamentos.rows;
                            for (const detallesDelApartamento of apartamentoEntidad) {
                                const apartamentoIDV = detallesDelApartamento.apartamentoIDV;
                                const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                                const estadoConfiguracion = detallesDelApartamento.estadoConfiguracion;
                                const estructuraFinal = {
                                    apartamentoIDV: apartamentoIDV,
                                    apartamentoUI: apartamentoUI,
                                    estadoConfiguracion: estadoConfiguracion
                                };
                                apartamentosConConfiguracion.push(estructuraFinal);
                            }
                        }
                        const ok = {
                            ok: apartamentosConConfiguracion
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error);
                    }

                }