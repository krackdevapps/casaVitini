import { conexion } from "../../componentes/db.mjs";
import { validadoresCompartidos } from "../../sistema/validadores/validadoresCompartidos.mjs";

export const imagenDelApartamento = async (entrada, salida) => {
    try {
        const apartamentoIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.apartamentoIDV,
            nombreCampo: "El campo del identiifcador visual de apartamento (apartamentoIDV)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const consultaApartamento = `
            SELECT imagen
            FROM "configuracionApartamento" 
            WHERE "apartamentoIDV" = $1;`;
        const resuelveApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
        if (resuelveApartamento.rowCount === 0) {
            const error = "No existe ningun apartamento con ese identificador visua, revisa el apartamentoIDV";
            throw new Error(error);
        }
        const ok = {
            ok: "Imagen de apartamento PNG en base64",
            imagen: resuelveApartamento.rows[0].imagen
        };
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}