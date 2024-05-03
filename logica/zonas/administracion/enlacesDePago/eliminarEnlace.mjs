import { conexion } from "../../../componentes/db.mjs";
export const eliminarEnlace = async (entrada, salida) => {
                try {
                    const enlaceUID = entrada.body.enlaceUID;
                    const filtroCadena = /^[0-9]+$/;
                    if (!enlaceUID || !filtroCadena.test(enlaceUID)) {
                        const error = "el campo 'enlaceUID' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                        throw new Error(error);
                    }
                    const seleccionarEnlace = await conexion.query(`SELECT reserva FROM "enlacesDePago" WHERE "enlaceUID" = $1`, [enlaceUID]);
                    if (seleccionarEnlace.rowCount === 0) {
                        const error = "No existe el enlace de pago";
                        throw new Error(error);
                    }
                    const eliminarEnlace = `
                            DELETE FROM "enlacesDePago"
                            WHERE "enlaceUID" = $1;
                            `;
                    const resuelveEliminarEnlace = await conexion.query(eliminarEnlace, [enlaceUID]);
                    if (resuelveEliminarEnlace.rowCount === 0) {
                        const error = "No existe el enlace";
                        throw new Error(error);
                    }
                    if (resuelveEliminarEnlace.rowCount === 1) {
                        const ok = {
                            ok: "Se ha eliminado el enlace correctamente"
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