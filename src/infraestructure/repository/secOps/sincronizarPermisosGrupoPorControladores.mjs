import { conexion } from "../globales/db.mjs";

export const sincronizarPermisosGrupoPorControladores = async (data) => {
    try {
        const grupoUID = data.grupoUID
        const nuevosControladoresUID = data.nuevosControladoresUID
        const consulta = `
        WITH data_to_insert(val) AS (
            SELECT UNNEST($1::bigInt[])
        )
        INSERT INTO
        permisos."permisosControladoresPorGrupos" ("controladorUID", "grupoUID" ,permiso)
        SELECT d.val, $2, 'noPermitido'
        FROM data_to_insert d
        WHERE NOT EXISTS (
          SELECT 1
          FROM permisos."permisosControladoresPorGrupos" t
          WHERE t."controladorUID" = d.val
            AND t."grupoUID" = $2
        );
        `;
        const p = [
            nuevosControladoresUID,
            grupoUID
        ]
        await conexion.query(consulta, p);
        /*
         INSERT INTO
                permisos."permisosControladoresPorGrupos"
                ("controladorUID", "grupoUID", permiso)
                SELECT UNNEST($1::bigInt[]), $2, 'noPermitido';
        */
    } catch (errorAdaptador) {
        throw errorAdaptador;
    }
}