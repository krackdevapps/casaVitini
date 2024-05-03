export const guardarNuevoClienteYSustituirloPorElClientePoolActual = async (entrada, salida) => {
                const mutex = new Mutex();
                const bloqueoGuardarNuevoClienteYSustituirloPorElClientePoolActual = await mutex.acquire();
                try {
                    const reserva = entrada.body.reserva;
                    const pernoctanteUID = entrada.body.pernoctanteUID;
                    let nombre = entrada.body.nombre;
                    let primerApellido = entrada.body.primerApellido;
                    let segundoApellido = entrada.body.segundoApellido;
                    let pasaporte = entrada.body.pasaporte;
                    let telefono = entrada.body.telefono;
                    let correoElectronico = entrada.body.correoElectronico;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    if (typeof pernoctanteUID !== "number" || !Number.isInteger(pernoctanteUID) || pernoctanteUID <= 0) {
                        const error = "el campo 'pernoctanteUID' solo puede un numero, entero y positivo";
                        throw new Error(error);
                    }
                    const nuevoClienteParaValidar = {
                        nombre: nombre,
                        primerApellido: primerApellido,
                        segundoApellido: segundoApellido,
                        pasaporte: pasaporte,
                        telefono: telefono,
                        correoElectronico: correoElectronico,
                        //notas: notas,
                    };
                    const datosValidados = await validadoresCompartidos.clientes.nuevoCliente(nuevoClienteParaValidar);
                    nombre = datosValidados.nombre;
                    primerApellido = datosValidados.primerApellido;
                    segundoApellido = datosValidados.segundoApellido;
                    pasaporte = datosValidados.pasaporte;
                    telefono = datosValidados.telefono;
                    correoElectronico = datosValidados.correoElectronico;
                    // Comprobar que la reserva exisste
                    const validacionReserva = `
                        SELECT 
                        reserva, "estadoReserva", "estadoPago"
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
                    // validar pernoctante y extraer el UID del clientePool
                    const validacionPernoctante = `
                        SELECT 
                        "clienteUID"
                        FROM 
                        "reservaPernoctantes"
                        WHERE 
                        reserva = $1 AND "pernoctanteUID" = $2
                        `;
                    const resuelveValidacionPernoctante = await conexion.query(validacionPernoctante, [reserva, pernoctanteUID]);
                    if (resuelveValidacionPernoctante.rowCount === 0) {
                        const error = "No existe el pernoctanteUID dentro de esta reserva";
                        throw new Error(error);
                    }
                    const clienteUID = resuelveValidacionPernoctante.rows[0].clienteUID;
                    if (clienteUID) {
                        const error = "El pernoctnte ya es un cliente y un clientePool";
                        throw new Error(error);
                    }
                    const ok = {};
                    const datosNuevoCliente = {
                        nombre: nombre,
                        primerApellido: primerApellido,
                        segundoApellido: segundoApellido,
                        pasaporte: pasaporte,
                        telefono: telefono,
                        correoElectronico: correoElectronico,
                        notas: null
                    };
                    const nuevoCliente = await insertarCliente(datosNuevoCliente);
                    const nuevoUIDCliente = nuevoCliente.uid;
                    // Borrar clientePool
                    const eliminarClientePool = `
                        DELETE FROM "poolClientes"
                        WHERE "pernoctanteUID" = $1;`;
                    const resuelveEliminarClientePool = await conexion.query(eliminarClientePool, [pernoctanteUID]);
                    if (resuelveEliminarClientePool.rowCount === 0) {
                        ok.informacion = "No se ha encontrado un clientePool asociado al pernoctante";
                    }
                    const actualizaPernoctanteReserva = `
                            UPDATE "reservaPernoctantes"
                            SET "clienteUID" = $3
                            WHERE reserva = $1 AND "pernoctanteUID" = $2
                            RETURNING
                            habitacion;
                            `;
                    const resuelveActualizaPernoctanteReserva = await conexion.query(actualizaPernoctanteReserva, [reserva, pernoctanteUID, nuevoUIDCliente]);
                    if (resuelveActualizaPernoctanteReserva.rowCount === 0) {
                        const error = "No se ha podido actualizar al pernoctante dentro de la reserva";
                        throw new Error(error);
                    }
                    if (resuelveActualizaPernoctanteReserva.rowCount === 1) {
                        const habitacionUID = resuelveActualizaPernoctanteReserva.rows[0].habitacion;
                        primerApellido = primerApellido ? primerApellido : "";
                        segundoApellido = segundoApellido ? segundoApellido : "";
                        ok.ok = "Se ha guardado al nuevo cliente y sustituido por el clientePool, tambien se ha eliminado al clientePool de la base de datos";
                        ok.nuevoClienteUID = nuevoUIDCliente;
                        ok.nombreCompleto = `${nombre} ${primerApellido} ${segundoApellido}`;
                        ok.pasaporte = pasaporte;
                        ok.habitacionUID = habitacionUID;
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                    bloqueoGuardarNuevoClienteYSustituirloPorElClientePoolActual();
                }
            }