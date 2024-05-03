export const detallesCliente = async (entrada, salida) => {
                try {
                    let cliente = entrada.body.cliente;
                    if (!cliente || !Number.isInteger(cliente)) {
                        const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente";
                        throw new Error(error);
                    }
                    let consultaDetallesCliente = `
                            SELECT 
                            uid, 
                            nombre,
                            "primerApellido",
                            "segundoApellido",
                            pasaporte,
                            telefono,
                            email,
                            notas 
                            FROM 
                            clientes 
                            WHERE 
                            uid = $1`;
                    let resolverConsultaDetallesCliente = await conexion.query(consultaDetallesCliente, [cliente]);
                    if (resolverConsultaDetallesCliente.rowCount === 0) {
                        const error = "No existe ningun clinete con ese UID";
                        throw new Error(error);
                    }
                    let detallesCliente = resolverConsultaDetallesCliente.rows[0];
                    let ok = {
                        "ok": detallesCliente
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                }
            }