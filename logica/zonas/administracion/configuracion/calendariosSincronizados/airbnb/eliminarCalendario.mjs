export const eliminarCalendario = async (entrada, salida) => {
                        try {
                            const calendarioUID = entrada.body.calendarioUID;
                            const filtroCadenaNumeros = /^[0-9]+$/;
                            if (!calendarioUID || !filtroCadenaNumeros.test(calendarioUID)) {
                                const error = "Hay que definir la calendarioUID, solo se admiten numeros sin espacios.";
                                throw new Error(error);
                            }
                            const consultaSelecionaCalendario = `
                                    SELECT 
                                    uid
                                    FROM 
                                    "calendariosSincronizados" 
                                    WHERE 
                                    uid = $1`;
                            const resuelveSelecionarCalendario = await conexion.query(consultaSelecionaCalendario, [calendarioUID]);
                            if (resuelveSelecionarCalendario.rowCount === 0) {
                                const error = "No existe el calendario que quieres borrar, por favor revisa el identificado calendarioUID que has introducido.";
                                throw new Error(error);
                            }
                            const consultaEliminar = `
                                    DELETE FROM "calendariosSincronizados"
                                    WHERE uid = $1;
                                    `;
                            const resuelveEliminarCalendario = await conexion.query(consultaEliminar, [calendarioUID]);
                            if (resuelveEliminarCalendario.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha eliminado correctamente el calendario"
                                };
                                salida.json(ok);
                            }
                            if (resuelveEliminarCalendario.rowCount === 0) {
                                const error = "Se ha enviado la información a la base de datos pero esta informa que no ha eliminado el calendario.";
                                throw new Error(error);
                            }
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error);
                        }

                    }