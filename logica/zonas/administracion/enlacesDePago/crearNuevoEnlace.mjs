export const crearNuevoEnlace = async (entrada, salida) => {
                try {
                    const error = "Hasta que no se pueda habilitar una pasarela de pago, esta opcion esta deshabilitada.";
                    throw new Error(error);
                    let nombreEnlace = entrada.body.nombreEnlace;
                    const reservaUID = entrada.body.reservaUID;
                    const cantidad = entrada.body.cantidad;
                    let horasCaducidad = entrada.body.horasCaducidad;
                    const filtroCadena = /^[0-9]+$/;
                    const filtroDecimales = /^\d+\.\d{2}$/;
                    const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
                    if (horasCaducidad) {
                        if (!filtroCadena.test(horasCaducidad)) {
                            const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00.";
                            throw new Error(error);
                        }
                    } else {
                        horasCaducidad = 72;
                    }
                    if (!cantidad || !filtroDecimales.test(cantidad)) {
                        const error = "el campo cantidad solo puede ser una cadena de numeros con dos decimales separados por punto, ejemplo 10.00.";
                        throw new Error(error);
                    }
                    if (nombreEnlace) {
                        if (!filtroTextoSimple.test(nombreEnlace)) {
                            const error = "el campo 'nombreEnlace' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
                            throw new Error(error);
                        }
                    } else {
                        nombreEnlace = `Enlace de pago de la reserva ${reservaUID}`;
                    }
                    const descripcion = entrada.body.descripcion;
                    if (descripcion) {
                        if (!filtroTextoSimple.test(descripcion)) {
                            const error = "el campo 'descripcion' solo puede ser una cadena de letras, numeros y espacios.";
                            throw new Error(error);
                        }
                    }
                    await controlCaducidadEnlacesDePago();
                    const resuelveValidarReserva = await validadoresCompartidos.reservas.validarReserva(reservaUID);
                    const estadoReserva = resuelveValidarReserva.estadoReserva;
                    const estadoPago = resuelveValidarReserva.estadoPago;
                    if (estadoReserva === "cancelada") {
                        const error = "No se puede generar un enlace de pago una reserva cancelada";
                        throw new Error(error);
                    }
                    if (estadoReserva !== "confirmada") {
                        const error = "No se puede generar un enlace de pago una reserva que no esta confirmada por que entonces el cliente podria pagar una reserva cuyo alojamiento no esta garantizado, reservado sin pagar vamos";
                        throw new Error(error);
                    }
                    const generarCadenaAleatoria = (longitud) => {
                        const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                        let cadenaAleatoria = '';
                        for (let i = 0; i < longitud; i++) {
                            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                            cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                        }
                        return cadenaAleatoria;
                    };
                    const validarCodigo = async (codigoAleatorio) => {
                        const validarCodigoAleatorio = `
                                SELECT
                                codigo
                                FROM "enlacesDePago"
                                WHERE codigo = $1;`;
                        const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio]);
                        if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                            return true;
                        }
                    };
                    const controlCodigo = async () => {
                        const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
                        let codigoGenerado;
                        let codigoExiste;
                        do {
                            codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                            codigoExiste = await validarCodigo(codigoGenerado);
                        } while (codigoExiste);
                        // En este punto, tenemos un código único que no existe en la base de datos
                        return codigoGenerado;
                    };
                    const codigoAleatorioUnico = await controlCodigo();
                    const fechaActual = new Date();
                    const fechaDeCaducidad = new Date(fechaActual.getTime() + (horasCaducidad * 60 * 60 * 1000));
                    const estadoPagoInicial = "noPagado";
                    const insertarEnlace = `
                                INSERT INTO "enlacesDePago"
                                (
                                "nombreEnlace",
                                reserva,
                                descripcion,
                                caducidad,
                                cantidad,
                                codigo,
                                "estadoPago"
                                )
                                VALUES ($1, $2, $3, $4, $5, $6, $7) 
                                RETURNING
                                "enlaceUID",
                                "nombreEnlace",
                                cantidad,
                                codigo
                                `;
                    const datosEnlace = [
                        nombreEnlace,
                        reservaUID,
                        descripcion,
                        fechaDeCaducidad,
                        cantidad,
                        codigoAleatorioUnico,
                        estadoPagoInicial
                    ];
                    const resuelveInsertarEnlace = await conexion.query(insertarEnlace, datosEnlace);
                    if (resuelveInsertarEnlace.rowCount === 0) {
                        const error = "No se ha podido insertar el nuevo enlace, reintentalo";
                        throw new Error(error);
                    }
                    if (resuelveInsertarEnlace.rowCount === 1) {
                        const enlaceUID = resuelveInsertarEnlace.rows[0].enlaceUID;
                        const nombreEnlace = resuelveInsertarEnlace.rows[0].nombreEnlace;
                        const cantidad = resuelveInsertarEnlace.rows[0].cantidad;
                        const enlace = resuelveInsertarEnlace.rows[0].codigo;
                        const ok = {
                            ok: "Se ha creado el enlace correctamente",
                            enlaceUID: enlaceUID,
                            nombreEnlace: nombreEnlace,
                            cantidad: cantidad,
                            enlace: enlace
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