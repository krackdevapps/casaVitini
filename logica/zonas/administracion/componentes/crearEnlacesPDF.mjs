export const crearEnlacesPDF = async (entrada, salida) => {
                try {
                    const reserva = entrada.body.reserva;
                    const enlaces = await componentes.gestionEnlacesPDF.crearEnlacePDF(reserva);
                    const ok = {
                        ok: "ok",
                        enlaces: enlaces
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                }
            }