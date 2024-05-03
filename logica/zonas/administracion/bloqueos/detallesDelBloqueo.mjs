import { conexion } from "../../../componentes/db.mjs";
import { eliminarBloqueoCaducado } from "./eliminarBloqueoCaducado.mjs";
import { resolverApartamentoUI } from "../../../sistema/sistemaDeResolucion/resolverApartamentoUI.mjs";

export const detallesDelBloqueo = async (entrada, salida) => {
                try {
                    const apartamentoIDV = entrada.body.apartamentoIDV;
                    const bloqueoUID = entrada.body.bloqueoUID;
                    const filtroCadena = /^[a-z0-9]+$/;
                    if (!filtroCadena.test(apartamentoIDV) || typeof apartamentoIDV !== "string") {
                        const error = "el campo 'apartmentoIDV' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                        throw new Error(error);
                    }
                    if (typeof bloqueoUID !== "number" || !Number.isInteger(bloqueoUID) && bloqueoUID <= 0) {
                        const error = "la clave 'bloqueoUID' debe de tener un dato tipo 'number', positivo y entero";
                        throw new Error(error);
                    }
                    await eliminarBloqueoCaducado();
                    const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                    const consultaDetallesBloqueo = `
                            SELECT
                            uid,
                            to_char(entrada, 'DD/MM/YYYY') as entrada, 
                            to_char(salida, 'DD/MM/YYYY') as salida, 
                            apartamento,
                            "tipoBloqueo",
                            motivo,
                            zona
                            FROM "bloqueosApartamentos"
                            WHERE apartamento = $1 AND uid = $2;`;
                    const resuelveConsultaDetallesBloqueo = await conexion.query(consultaDetallesBloqueo, [apartamentoIDV, bloqueoUID]);
                    if (resuelveConsultaDetallesBloqueo.rowCount === 0) {
                        const error = "No existe el bloqueo, comprueba el apartamentoIDV y el bloqueoUID";
                        throw new Error(error);
                    }
                    if (resuelveConsultaDetallesBloqueo.rowCount === 1) {
                        const bloqueosEncontradosDelApartamento = resuelveConsultaDetallesBloqueo.rows[0];
                        const uidBloqueo = bloqueosEncontradosDelApartamento.uid;
                        const tipoBloqueo = bloqueosEncontradosDelApartamento.tipoBloqueo;
                        const entrada = bloqueosEncontradosDelApartamento.entrada;
                        const salida_ = bloqueosEncontradosDelApartamento.salida;
                        const motivo = bloqueosEncontradosDelApartamento.motivo;
                        const zona = bloqueosEncontradosDelApartamento.zona;
                        const estructuraBloqueo = {
                            uidBloqueo: uidBloqueo,
                            tipoBloqueo: tipoBloqueo,
                            entrada: entrada,
                            salida: salida_,
                            motivo: motivo,
                            zona: zona
                        };
                        const ok = {};
                        ok.apartamentoIDV = apartamentoIDV;
                        ok.apartamentoUI = apartamentoUI;
                        ok.ok = estructuraBloqueo;
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                }

            }