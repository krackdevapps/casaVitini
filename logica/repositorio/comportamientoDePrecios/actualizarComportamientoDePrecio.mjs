import { conexion } from "../../componentes/db.mjs";
export const actualizarComportamientoDePrecio = async (data) => {
    try {

        const nombreComportamiento = data.nombreComportamiento
        const fechaInicio_ISO = data.fechaInicio_ISO
        const fechaFinal_ISO = data.fechaFinal_ISO
        const tipo = data.tipo
        const diasArray = data.diasArray
        const comportamientoUID = data.comportamientoUID

        const consulta = `
        UPDATE "comportamientoPrecios"
        SET 
        "nombreComportamiento" = $1,
        "fechaInicio" = $2,
        "fechaFinal" = $3,
        "tipoIDV" = $4,
        "diasArray" = $5
        WHERE 
        "comportamientoUID" = $6
        RETURNING *;
        `;
        const parametros = [
            nombreComportamiento,
            fechaInicio_ISO,
            fechaFinal_ISO,
            tipo,
            diasArray,
            comportamientoUID,
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe ningun comportamiento de precio con ese comportamientoUID, revisa el identificador";
            throw new Error(error)
        }
        return resuelve.rows[0]

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
