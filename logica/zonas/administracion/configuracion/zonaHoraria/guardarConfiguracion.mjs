export const guardarConfiguracion = async (entrada, salida) => {
                    try {
                        const zonaHoraria = entrada.body.zonaHoraria;
                        const filtroZonaHoraria = /^[a-zA-Z0-9\/_\-+]+$/;
                        const filtroHora = /^(0\d|1\d|2[0-3]):([0-5]\d)$/;
                        if (!zonaHoraria || !filtroZonaHoraria.test(zonaHoraria)) {
                            const error = "el campo 'zonaHorarial' solo puede ser letras minúsculas, mayúsculas, guiones bajos y medios, signo mac y numeros";
                            throw new Error(error);
                        }
                        // Validar que la zona horarai exista
                        const validarZonaHoraria = (zonaHorariaAValidar) => {
                            let resultadoFinal = "no";
                            const listaZonasHorarias = zonasHorarias();
                            for (const zonaHoraria of listaZonasHorarias) {
                                if (zonaHoraria === zonaHorariaAValidar) {
                                    resultadoFinal = "si";
                                }
                            }
                            return resultadoFinal;
                        };
                        if (validarZonaHoraria(zonaHoraria) === "no") {
                            const error = "el campo 'zonaHorariaGlobal' no existe";
                            throw new Error(error);
                        }
                        await conexion.query('BEGIN'); // Inicio de la transacción
                        const actualizarConfiguracionGlobal = `
                                        UPDATE "configuracionGlobal"
                                        SET
                                          valor = $1
                                        WHERE
                                          "configuracionUID" = $2;
                                        `;
                        const nuevaConfiguracion = [
                            zonaHoraria,
                            "zonaHoraria"
                        ];
                        const consultaValidarApartamento = await conexion.query(actualizarConfiguracionGlobal, nuevaConfiguracion);
                        if (consultaValidarApartamento.rowCount === 0) {
                            const error = "No se ha podido actualizar la configuracion, reintentalo";
                            throw new Error(error);
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {
                            ok: "Se ha actualizado correctamente la configuracion"
                        };
                        salida.json(ok);
                    } catch (errorCapturado) {
                        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error);
                    }
                }