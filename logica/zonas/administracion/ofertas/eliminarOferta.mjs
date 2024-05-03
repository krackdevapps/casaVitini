import { conexion } from "../../../componentes/db.mjs";

conexion
export const eliminarOferta = async (entrada, salida) => {
                await mutex.acquire();
                try {
                    const ofertaUID = entrada.body.ofertaUID;
                    if (!ofertaUID || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                        const error = "El campo ofertaUID tiene que ser un numero, positivo y entero";
                        throw new Error(error);
                    }
                    // Validar nombre unico oferta
                    const validarOferta = `
                            SELECT uid
                            FROM ofertas
                            WHERE uid = $1;
                            `;
                    let resuelveValidarOferta = await conexion.query(validarOferta, [ofertaUID]);
                    if (resuelveValidarOferta.rowCount === 0) {
                        const error = "No existe al oferta, revisa el UID introducie en el campo ofertaUID, recuerda que debe de ser un number";
                        throw new Error(error);
                    }
                    await conexion.query('BEGIN'); // Inicio de la transacción
                    let eliminarEstadoOferta = `
                            DELETE FROM ofertas
                            WHERE uid = $1;
                            `;
                    let resuelveEliminarEstadoOferta = await conexion.query(eliminarEstadoOferta, [ofertaUID]);
                    const ok = {
                        "ok": "Se ha eliminado la oferta correctamente",
                    };
                    salida.json(ok);
                    await conexion.query('COMMIT'); // Confirmar la transacción
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                    mutex.release();
                }

            }