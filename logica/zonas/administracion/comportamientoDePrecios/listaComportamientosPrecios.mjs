import { conexion } from "../../../componentes/db.mjs";
export const listaComportamientosPrecios = async (entrada, salida) => {
                try {
                    const listaComportamientoPrecios = `
                            SELECT
                            "nombreComportamiento",
                            uid,
                            to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                            to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal",
                            explicacion,
                            estado,
                            tipo,
                            "diasArray"
                            FROM 
                            "comportamientoPrecios"
                            ORDER BY 
                            "fechaInicio" ASC;
                            `;
                    const resuelveListaComportamientoPrecios = await conexion.query(listaComportamientoPrecios);
                    const ok = {};
                    if (resuelveListaComportamientoPrecios.rowCount === 0) {
                        ok.ok = "No hay comportamiento de precios configurados";
                        salida.json(ok);
                    }
                    if (resuelveListaComportamientoPrecios.rowCount > 0) {

                        const listaComportamientos = resuelveListaComportamientoPrecios.rows;
                        ok.ok = listaComportamientos;
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                }
            }