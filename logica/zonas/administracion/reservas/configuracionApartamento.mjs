import { configuracionApartamento as configuracionApartamento_ } from "../../../sistema/configuracionApartamento.mjs";

export const configuracionApartamento = async (entrada, salida) => {
                try {
                    let apartamentos = entrada.body.apartamentos;
                    const transactor = await configuracionApartamento_(apartamentos);
                    salida.json(transactor);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                }
            
            }