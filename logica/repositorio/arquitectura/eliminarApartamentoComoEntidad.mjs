import { conexion } from "../../componentes/db.mjs";

export const eliminarApartamentoComoEntidad = async (apartamentoIDV) => {
    try {

        const consulta = `
        DELETE FROM apartamentos
        WHERE apartamento = 'test';
        `;

        const resuelve = await conexion.query(consulta, [apartamentoIDV])
        return resuelve
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}