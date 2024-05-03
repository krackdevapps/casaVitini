export const insertarDatosFinancierosReservaExistente = async (entrada, salida) => {
                try {
                    const reserva = entrada.body.reserva;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo1";
                        throw new Error(error);
                    }
                    const transaccionPrecioReserva = {
                        tipoProcesadorPrecio: "uid",
                        reservaUID: reserva
                    };
                    const resuelvePrecioReserva = await insertarTotalesReserva(transaccionPrecioReserva);
                    const metadatosDetallesReserva = {
                        reservaUID: reserva
                    };
                    const reseuvleDetallesReserva = await detallesReserva(metadatosDetallesReserva);
                    const respuesta = {
                        "ok": resuelvePrecioReserva,
                        "desgloseFinanciero": reseuvleDetallesReserva.desgloseFinanciero
                    };
                    salida.json(respuesta);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                }
            }