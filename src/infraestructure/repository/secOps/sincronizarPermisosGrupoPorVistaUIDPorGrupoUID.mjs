import { conexion } from "../globales/db.mjs";

export const sincronizarPermisosGrupoPorVistaUIDPorGrupoUID = async (data) => {
    try {
        const grupoUID = data.grupoUID
        const nuevasVistasUID = data.nuevasVistasUID
        const consulta = `
           WITH data_to_insert(val) AS (
            SELECT UNNEST($1::bigInt[])
        )
        INSERT INTO
        permisos."permisosVistasPorGrupos" ("vistaUID", "grupoUID" ,permiso)
        SELECT d.val, $2, 'noPermitido'
        FROM data_to_insert d
        WHERE NOT EXISTS (
          SELECT 1
          FROM permisos."permisosVistasPorGrupos" t
          WHERE t."vistaUID" = d.val
            AND t."grupoUID" = $2
        );
        `;
        const p = [
            nuevasVistasUID,
            grupoUID
        ]
        await conexion.query(consulta, p);
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}