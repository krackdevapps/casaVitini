import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { obtenerDetallesOferta } from "../../../sistema/sistemaDeOfertas/obtenerDetallesOferta.mjs";

export const detallesOferta = async (entrada, salida) => {
                try {
                    const session = entrada.session
                    const IDX = new VitiniIDX(session, salida)
                    IDX.administradores()
                    if (IDX.control()) return
                    
                    const ofertaUID = entrada.body.ofertaUID;
                    if (!ofertaUID || typeof ofertaUID !== "number" || !Number.isInteger(ofertaUID) || ofertaUID <= 0) {
                        const error = "El campo 'ofertaUID' debe ser un tipo numero, entero y positivo";
                        throw new Error(error);
                    }
                    const detallesOferta = await obtenerDetallesOferta(ofertaUID);
                    const ok = {
                        ok: detallesOferta
                    };
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                }
            }