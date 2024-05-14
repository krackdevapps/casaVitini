import { conexion } from "../../componentes/db.mjs";
export const insertarApartamentosEnOferta = async (data) => {
    try {

        const ofertaUID = data.ofertaUID
        const apartamentos = data.apartametnos
        const contextoAplicacion = data.contextoAplicacion

        for (const detallesDelApartamento of apartamentos) {
            const apartamentoIDV = detallesDelApartamento.apartamentoIDV;
            let tipoDescuento = null;
            let cantidadPorApartamento = null;
            if (contextoAplicacion === "totalNetoApartamentoDedicado") {
                tipoDescuento = detallesDelApartamento.tipoDescuento;
                cantidadPorApartamento = detallesDelApartamento.cantidad;
            }
            const consulta = `
                INSERT INTO "ofertasApartamentos"
                (
                oferta,
                apartamento,
                "tipoDescuento",
                cantidad
                )
                VALUES
                (
                NULLIF($1::numeric, NULL),
                COALESCE($2, NULL),
                COALESCE($3, NULL),
                NULLIF($4::numeric, NULL)
                )
                RETURNING uid;`;

            const parametros = [
                Number(ofertaUID),
                apartamentoIDV,
                tipoDescuento,
                Number(cantidadPorApartamento)
            ]

            await conexion.query(consulta, parametros);
        }
        return resuelve.rows[0]
    } catch (error) {
        throw error
    }
}
