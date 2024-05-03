export const detallesDelReembolso = async (entrada, salida) => {
                    try {
                        const reembolsoUID = entrada.body.reembolsoUID;
                        const filtroCadena = /^[0-9]+$/;
                        if (!reembolsoUID || !filtroCadena.test(reembolsoUID)) {
                            const error = "el campo 'reembolsoUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                        // const actualizarReembolso = await componentes.administracion.reservas.transacciones.actualizarSOLOreembolsoDesdeSquare(reembolsoUID)
                        // if (actualizarReembolso.error) {
                        //     throw new Error(actualizarReembolso.error)
                        // }
                        const validarReembolso = `
                            SELECT
                                "pagoUID",
                                cantidad,
                                "plataformaDePago",
                                "reembolsoUIDPasarela",
                                "estado",
                                "fechaCreacion"::text AS "fechaCreacion",
                                "fechaActualizacion"::text AS "fechaActualizacion"
                            FROM 
                                "reservaReembolsos"
                            WHERE 
                                "reembolsoUID" = $1;`;
                        const reseulveValidarReembolso = await conexion.query(validarReembolso, [reembolsoUID]);
                        if (reseulveValidarReembolso.rowCount === 0) {
                            const error = "No existe ningún reembolso con ese reembolsoUID";
                            throw new Error(error);
                        }
                        if (reseulveValidarReembolso.rowCount === 1) {
                            const detallesDelReembolso = reseulveValidarReembolso.rows[0];
                            const pagoUID = detallesDelReembolso.pagoUID;
                            const cantidad = detallesDelReembolso.cantidad;
                            const plataformaDePag = detallesDelReembolso.plataformaDePag;
                            const reembolsoUIDPasarela = detallesDelReembolso.reembolsoUIDPasarela;
                            const estado = detallesDelReembolso.estado;
                            const fechaCreacion = detallesDelReembolso.fechaCreacion;
                            const fechaActualizacion = detallesDelReembolso.fechaActualizacion;
                            const ok = {
                                ok: "Aqui tienes los detalles del reembolso",
                                pagoUID: pagoUID,
                                cantidad: cantidad,
                                plataformaDePag: plataformaDePag,
                                reembolsoUIDPasarela: reembolsoUIDPasarela,
                                estado: estado,
                                fechaCreacion: fechaCreacion,
                                fechaActualizacion: fechaActualizacion,
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