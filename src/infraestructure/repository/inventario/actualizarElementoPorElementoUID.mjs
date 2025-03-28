import { conexion } from "../globales/db.mjs";

export const actualizarElementoPorElementoUID = async (data) => {
    try {
        const elementoUID = data.elementoUID
        const nombre = data.nombre
        const tipoLimite = data.tipoLimite
        const cantidadMinima = data.cantidadMinima
        const descripcion = data.descripcion

        const consulta = `
        UPDATE "inventarioGeneral"
        SET 
        nombre = COALESCE($1, nombre),
        "tipoLimite" = COALESCE($2, "tipoLimite"),
        "cantidadMinima" = COALESCE($3, "cantidadMinima"),
        "descripcion" = COALESCE($4, "descripcion")
        WHERE "UID" = $5
        RETURNING
        *
        `;
        const parametros = [
            nombre,
            tipoLimite,
            cantidadMinima,
            descripcion,
            elementoUID
        ]
        const resuelve = await conexion.query(consulta, parametros);
        if (resuelve.rowCount === 0) {
            const error = "No existe el elelmento en el inventario, revisa el elementoUID.";
            throw new Error(error);
        }
        return resuelve.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador
    }

}