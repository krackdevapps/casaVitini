export const estadoReserva = async (entrada, salida) => {
                try {
                    let reserva = entrada.body.reserva;
                    if (typeof reserva !== "number" || !Number.isInteger(reserva) || reserva <= 0) {
                        const error = "El campo 'reserva' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const consultaEstadoReservas = `
                        SELECT 
                        reserva,
                        "estadoPago",
                        "estadoReserva"
                        FROM reservas 
                        WHERE reserva = $1;`;
                    const resuelveConsultaEstadoReservas = await conexion.query(consultaEstadoReservas, [reserva]);
                    if (resuelveConsultaEstadoReservas.rowCount === 0) {
                        const error = "No existe al reserva";
                        throw new Error(error);
                    }
                    if (resuelveConsultaEstadoReservas.rowCount === 1) {
                        const ok = {
                            "estadoReserva": resuelveConsultaEstadoReservas.rows[0].estadoReserva,
                            "estadoPago": resuelveConsultaEstadoReservas.rows[0].estadoPago
                        };
                        salida.json(ok);
                    }
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                }
            }