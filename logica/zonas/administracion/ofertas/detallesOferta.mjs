import { conexion } from "../../../componentes/db.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { obtenerDetallesOferta } from "../../../sistema/ofertas/obtenerDetallesOferta.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const detallesOferta = async (entrada, salida) => {
                try {
                    const session = entrada.session
                    const IDX = new VitiniIDX(session, salida)
                    IDX.administradores()
                    if (IDX.control()) return
                    
                    const ofertaUID = validadoresCompartidos.tipos.numero({
                        string: entrada.body.ofertaUID,
                        nombreCampo: "El identificador universal de la oferta (ofertaUID)",
                        filtro: "numeroSimple",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                        sePermitenNegativos: "no"
                    })
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