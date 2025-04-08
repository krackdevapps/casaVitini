import { conexion } from "../../globales/db.mjs";

export const insertarNuevoGrupo = async (data) => {
    try {
        const grupoUI = data.grupoUI
        const testingVI = data.testingVI

        const consulta = `
        INSERT INTO
        permisos.grupos ("grupoUI", "testingVI")
        VALUES
        ($1, $2)
        RETURNING *;
          `;
        
        const p = [
            grupoUI,
            testingVI
        ]
        const controladores = await conexion.query(consulta, p);
        return controladores.rows[0]
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}