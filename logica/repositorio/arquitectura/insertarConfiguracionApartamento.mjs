import { conexion } from "../../componentes/db.mjs";

export const insertarConfiguracionApartamento = async (data) => {
    try {

        const apartamentoIDV = data.apartamentoIDV
        const estadoInicial = data.estadoInicial

        const consulta = `
        INSERT INTO "configuracionApartamento"
        (
        "apartamentoIDV",
        "estadoConfiguracion"
        )
        VALUES 
        (
        $1,
        $2
        )
        RETURNING *
        `;
        const resuelve = await conexion.query(consulta, [apartamentoIDV, estadoInicial]);
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }
}