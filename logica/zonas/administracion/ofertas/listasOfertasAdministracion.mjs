import { conexion } from "../../../componentes/db.mjs";

conexion
export const listasOfertasAdministracion = async (entrada, salida) => {
    try {
        const listarOfertas = `
                            SELECT
                            "nombreOferta",
                            uid,
                            to_char("fechaInicio", 'DD/MM/YYYY') as "fechaInicio", 
                            to_char("fechaFin", 'DD/MM/YYYY') as "fechaFin",
                            "numero",
                            "simboloNumero",
                            "descuentoAplicadoA" ,
                            "estadoOferta",
                            "tipoOferta",
                            "cantidad",
                            "tipoDescuento"
                            FROM 
                            ofertas 
                            ORDER BY 
                            "fechaInicio" ASC;
                            `;
        const resuelveListarOfertas = await conexion.query(listarOfertas);
        if (resuelveListarOfertas.rowCount === 0) {
            const ok = {
                ok: "No hay ofertas configuradas"
            };
            salida.json(ok);
        }
        if (resuelveListarOfertas.rowCount > 0) {
            const ofertas = resuelveListarOfertas.rows;
            for (const ofertaDetalles of ofertas) {
                const uid = ofertaDetalles.uid;
                const tipoOferta = ofertaDetalles.tipoOferta;
                const descuentoAplicadoA = ofertaDetalles.descuentoAplicadoA;
                if (tipoOferta === "porApartamentosEspecificos") {
                    //Arreglar esto, esto esta bien es una resolucion en modo joint
                    const detallesApartamentosDedicados = `
                                        SELECT
                                        oa.apartamento AS "apartamentoIDV",
                                        a."apartamentoUI",
                                        oa."tipoDescuento",
                                        oa."cantidad"
                                        FROM 
                                        "ofertasApartamentos" oa
                                        LEFT JOIN
                                        "apartamentos" a ON oa.apartamento = a.apartamento
                                        WHERE oferta = $1
                                        `;
                    const resuelveDetallesApartamentosDedicados = await conexion.query(detallesApartamentosDedicados, [uid]);
                    if (resuelveDetallesApartamentosDedicados.rowCount === 0) {
                        ofertaDetalles.apartamentosDedicados = [];
                    }
                    if (resuelveDetallesApartamentosDedicados.rowCount > 0) {
                        const apartamentosDedicados = resuelveDetallesApartamentosDedicados.rows;
                        ofertaDetalles.apartamentosDedicados = [];
                        apartamentosDedicados.map((apartamento) => {
                            const apartamentoIDV = apartamento.apartamentoIDV;
                            const apartamentoUI = apartamento.apartamentoUI;
                            const tipoDescuentoApartamento = apartamento.tipoDescuento;
                            const cantidadApartamento = apartamento.cantidad;
                            const detallesApartamentoDedicado = {
                                apartamentoIDV: apartamentoIDV,
                                apartamentoUI: apartamentoUI,
                                tipoDescuento: tipoDescuentoApartamento,
                                cantidadApartamento: cantidadApartamento
                            };
                            ofertaDetalles.apartamentosDedicados.push(detallesApartamentoDedicado);
                        });
                    }
                }
            }
            const ok = {
                ok: ofertas
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