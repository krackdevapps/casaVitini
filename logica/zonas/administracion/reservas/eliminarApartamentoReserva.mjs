export const eliminarApartamentoReserva = async (entrada, salida) => {
                const mutex = new Mutex();
                const bloqueoEliminarApartamentoReserva = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    // apartamentoUID
                    const apartamento = entrada.body.apartamento;
                    const tipoBloqueo = entrada.body.tipoBloqueo;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof apartamento !== "number" || !Number.isInteger(apartamento) || apartamento <= 0) {
                        const error = "el campo 'apartamento' solo puede un numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (tipoBloqueo !== "permanente" && tipoBloqueo !== "rangoTemporal" && tipoBloqueo !== "sinBloqueo") {
                        const error = "El campo 'tipoBloqueo' solo puede ser 'permanente', 'rangoTemporal', 'sinBloquo'";
                        throw new Error(error);
                    }

                    await conexion.query('BEGIN'); // Inicio de la transacción


                    // Comprobar que la reserva exisste
                    const validacionReserva = `
                        SELECT 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        "estadoReserva",
                        "estadoPago"
                        FROM reservas
                        WHERE reserva = $1
                        `;
                    const resuelveValidacionReserva = await conexion.query(validacionReserva, [reserva]);
                    if (resuelveValidacionReserva.rowCount === 0) {
                        const error = "No existe la reserva";
                        throw new Error(error);
                    }
                    if (resuelveValidacionReserva.rows[0].estadoReserva === "cancelada") {
                        const error = "La reserva no se puede modificar por que esta cancelada";
                        throw new Error(error);
                    }
                    // Comprobar si existen totales en esta reserva
                    const validarExistenciaTotales = `
                        SELECT 
                        *
                        FROM "reservaTotales"
                        WHERE reserva = $1
                        `;
                    const resuelveValidarExistenciaTotales = await conexion.query(validarExistenciaTotales, [reserva]);
                    let estadoInfomracionFinanciera = "actualizar";
                    const fechaEntrada_ISO = resuelveValidacionReserva.rows[0].fechaEntrada_ISO;
                    const fechaSalida_ISO = resuelveValidacionReserva.rows[0].fechaSalida_ISO;
                    const metadatos = {
                        reserva: reserva,
                        apartamentoUID: apartamento,
                        tipoBloqueo: tipoBloqueo,
                        fechaEntrada_ISO: fechaEntrada_ISO,
                        fechaSalida_ISO: fechaSalida_ISO,
                        zonaBloqueo: "publico",
                        origen: "eliminacionApartamentoDeReserva"
                    };
                    await bloquearApartamentos(metadatos);
                    const eliminaApartamentoReserva = `
                        DELETE 
                        FROM 
                            "reservaApartamentos"
                        WHERE 
                            uid = $1 
                        AND 
                            reserva = $2;
                        `;
                    const resuelveEliminaApartamentoReserva = await conexion.query(eliminaApartamentoReserva, [apartamento, reserva]);
                    if (resuelveEliminaApartamentoReserva.rowCount === 1) {
                        const consultaNumeroDeApartamentos = `
                            SELECT 
                            *
                            FROM "reservaApartamentos"
                            WHERE reserva = $1
                            `;
                        const resuelveNumeroDeApartamentosRestantesEnReserva = await conexion.query(consultaNumeroDeApartamentos, [reserva]);
                        if (resuelveNumeroDeApartamentosRestantesEnReserva.rowCount === 0) {
                            const eliminaApartamentoReservaQueries = [
                                'DELETE FROM "reservaImpuestos" WHERE reserva = $1;',
                                'DELETE FROM "reservaOfertas" WHERE reserva = $1;',
                                'DELETE FROM "reservaTotales" WHERE reserva = $1;',
                                'DELETE FROM "reservaTotalesPorApartamento" WHERE reserva = $1;',
                                'DELETE FROM "reservaTotalesPorNoche" WHERE reserva = $1;'
                            ];
                            for (const query of eliminaApartamentoReservaQueries) {
                                await conexion.query(query, [reserva]);
                            }
                        }
                        if (resuelveNumeroDeApartamentosRestantesEnReserva.rowCount > 0) {
                            const transaccionPrecioReserva = {
                                tipoProcesadorPrecio: "uid",
                                reservaUID: reserva
                            };
                            await insertarTotalesReserva(transaccionPrecioReserva);
                        }
                        await conexion.query('COMMIT'); // Confirmar la transacción
                        const ok = {};
                        ok.estadoDesgloseFinanciero = estadoInfomracionFinanciera;
                        if (tipoBloqueo === "rangoTemporal") {
                            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo temporal";
                        }
                        if (tipoBloqueo === "permanente") {
                            ok.ok = "Se ha eliminado el apartamento y aplicado el bloqueo permanente";
                        }
                        if (tipoBloqueo === "sinBloqueo") {
                            ok.ok = "Se ha eliminado el apartamento de la reserva y se ha liberado";
                        }
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                    bloqueoEliminarApartamentoReserva();
                }
            }