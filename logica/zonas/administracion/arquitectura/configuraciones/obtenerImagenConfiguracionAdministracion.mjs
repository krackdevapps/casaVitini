export const obtenerImagenConfiguracionAdministracion = async (entrada, salida) => {
                    try {
                        const apartamentoIDV = entrada.body.apartamentoIDV;
                        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                        if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
                            const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                            throw new Error(error);
                        }
                        const consultaPerfilConfiguracion = `
                                SELECT 
                                imagen
                                imagen
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;
                                `;
                        const resuelveConsultaPerfilConfiguracion = await conexion.query(consultaPerfilConfiguracion, [apartamentoIDV]);
                        if (resuelveConsultaPerfilConfiguracion.rowCount === 0) {
                            const error = "No hay ninguna configuracion disponible para este apartamento";
                            throw new Error(error);
                        }
                        if (resuelveConsultaPerfilConfiguracion.rowCount === 1) {
                            const imagen = resuelveConsultaPerfilConfiguracion.rows[0].imagen;
                            const ok = {
                                ok: "Imagen de la configuracion adminsitrativa del apartamento, png codificado en base64",
                                imagen: imagen
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