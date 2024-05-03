export const detallesComportamiento = async (entrada, salida) => {
                try {
                    const comportamientoUID = entrada.body.comportamientoUID;
                    if (!comportamientoUID || typeof comportamientoUID !== "number" || !Number.isInteger(comportamientoUID) || comportamientoUID <= 0) {
                        const error = "El campo 'comportamientoUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const consultaDetallesComportamiento = `
                            SELECT
                            uid,
                            to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                            to_char("fechaFinal", 'DD/MM/YYYY') as "fechaFinal", 
                            "nombreComportamiento",
                            estado,
                            tipo,
                            "diasArray"
                            FROM
                            "comportamientoPrecios" 
                            WHERE
                            uid = $1;
                            `;
                    const resuelveConsultaDetallesComportamiento = await conexion.query(consultaDetallesComportamiento, [comportamientoUID]);
                    const detallesComportamiento = resuelveConsultaDetallesComportamiento.rows[0];


                    if (resuelveConsultaDetallesComportamiento.rowCount === 0) {
                        const error = "No existe ninguna comportamiento de precio con ese UID";
                        throw new Error(error);
                    }
                    if (resuelveConsultaDetallesComportamiento.rowCount === 1) {
                        detallesComportamiento["apartamentos"] = [];
                        const detallesApartamentosDedicados = `
                                    SELECT
                                    cpa.uid,
                                    cpa."apartamentoIDV",
                                    cpa."cantidad",
                                    cpa."comportamientoUID",
                                    a."apartamentoUI",
                                    cpa."simbolo"
                                    FROM 
                                    "comportamientoPreciosApartamentos" cpa
                                    JOIN
                                    apartamentos a ON cpa."apartamentoIDV" = a.apartamento
                                    WHERE "comportamientoUID" = $1;
                                    `;
                        const resuelveDetallesApartamentosDedicados = await conexion.query(detallesApartamentosDedicados, [comportamientoUID]);
                        if (resuelveDetallesApartamentosDedicados.rowCount > 0) {
                            const apartamentosDedicados = resuelveDetallesApartamentosDedicados.rows;
                            apartamentosDedicados.map((apartamento) => {
                                const cantidad = apartamento.cantidad;
                                const apartamentoIDV = apartamento.apartamentoIDV;
                                const comportamientoUID = apartamento.comportamientoUID;
                                const simbolo = apartamento.simbolo;
                                const apartamentoUI = apartamento.apartamentoUI;
                                const detallesApartamentoDedicado = {
                                    apartamentoIDV: apartamentoIDV,
                                    apartamentoUI: apartamentoUI,
                                    cantidad: cantidad,
                                    comportamientoUID: comportamientoUID,
                                    simbolo: simbolo
                                };
                                detallesComportamiento["apartamentos"].push(detallesApartamentoDedicado);
                            });
                        }
                        const ok = {
                            ok: detallesComportamiento
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