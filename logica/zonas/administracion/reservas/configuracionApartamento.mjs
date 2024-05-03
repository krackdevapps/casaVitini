export const configuracionApartamento = async (entrada, salida) => {
                try {
                    let apartamentos = entrada.body.apartamentos;
                    const transactor = await configuracionApartamento(apartamentos);
                    salida.json(transactor);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                }
            }