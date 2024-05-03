export const asociarTitular = async (entrada, salida) => {
                    try {
                        const clienteUID = entrada.body.clienteUID;
                        const reservaUID = entrada.body.reservaUID;
                        if (typeof clienteUID !== "number" || !Number.isInteger(clienteUID) || clienteUID <= 0) {
                            const error = "el campo 'clienteUID' solo puede un numero, entero y positivo";
                            throw new Error(error);
                        }
                        if (typeof reservaUID !== "number" || !Number.isInteger(reservaUID) || reservaUID <= 0) {
                            const error = "el campo 'reservaUID' solo puede un numero, entero y positivo";
                            throw new Error(error);
                        }
                        const validarCliente = `
                            SELECT
                            uid,
                            nombre,
                            "primerApellido",
                            "segundoApellido",
                            pasaporte,
                            telefono,
                            email
                            FROM 
                            clientes
                            WHERE
                            uid = $1`;
                        const resuelveValidarCliente = await conexion.query(validarCliente, [clienteUID]);
                        if (resuelveValidarCliente.rowCount === 0) {
                            const error = "No existe el cliente";
                            throw new Error(error);
                        }
                        if (resuelveValidarCliente.rowCount === 1) {
                            const consultaElimintarTitularPool = `
                                DELETE FROM 
                                "poolTitularesReserva"
                                WHERE
                                reserva = $1;
                                `;
                            await conexion.query(consultaElimintarTitularPool, [reservaUID]);
                            const eliminaTitular = `
                                DELETE FROM 
                                "reservaTitulares"
                                WHERE
                                "reservaUID" = $1;
                                `;
                            await conexion.query(eliminaTitular, [reservaUID]);
                            const nombre = resuelveValidarCliente.rows[0].nombre;
                            const primerApellido = resuelveValidarCliente.rows[0].primerApellido ? resuelveValidarCliente.rows[0].primerApellido : "";
                            const segundoApellido = resuelveValidarCliente.rows[0].segundoApellido ? resuelveValidarCliente.rows[0].segundoApellido : "";
                            const pasaporte = resuelveValidarCliente.rows[0].pasaporte;
                            const email = resuelveValidarCliente.rows[0].email ? resuelveValidarCliente.rows[0].email : "";
                            const telefono = resuelveValidarCliente.rows[0].telefono ? resuelveValidarCliente.rows[0].telefono : "";
                            const nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
                            await validadoresCompartidos.reservas.validarReserva(reservaUID);
                            const consultaActualizarTitular = `
                                INSERT INTO "reservaTitulares"
                                (
                                "titularUID",
                                "reservaUID"
                                )
                                VALUES ($1, $2);`;
                            const datosParaActualizar = [
                                clienteUID,
                                reservaUID
                            ];
                            const resuelveActualizarTitular = await conexion.query(consultaActualizarTitular, datosParaActualizar);
                            if (resuelveActualizarTitular.rowCount === 0) {
                                const error = "No se ha podido actualizar el titular de la reserva";
                                throw new Error(error);
                            }
                            const ok = {
                                ok: "Se ha actualizado correctamente el titular en la reserva",
                                clienteUID: clienteUID,
                                nombreCompleto: nombreCompleto,
                                email: email,
                                nombre: nombre,
                                telefono: telefono,
                                primerApellido: primerApellido,
                                segundoApellido: segundoApellido,
                                pasaporte: pasaporte
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