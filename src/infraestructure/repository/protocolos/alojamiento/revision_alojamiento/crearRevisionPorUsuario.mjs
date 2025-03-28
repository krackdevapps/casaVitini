import { conexion } from "../../../globales/db.mjs";

export const crearRevisionPorUsuario = async (data) => {
   
    try {
        const fechaInicio = data.fechaInicio
        const usuario = data.usuario
        const estadoRevision = data.estadoRevision
        const apartamentoIDV = data.apartamentoIDV

        const consulta = `
        INSERT INTO  protocolos."revisionAlojamiento"
        (
        "fechaInicio",
        usuario,
        "estadoRevision",
        "apartamentoIDV"
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `;
        const parametros = [
            fechaInicio,
            usuario,
            estadoRevision,
            apartamentoIDV
        ]
        const resuelve = await conexion.query(consulta, parametros);
        return resuelve.rows[0]
    } catch (errorCapturado) {
        throw errorCapturado
    }

}