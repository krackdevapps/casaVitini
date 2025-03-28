import { conexion } from "../globales/db.mjs";

export const obtenerResultadosBusquedaEnElRegistro = async (data) => {
    try {

        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina_humano = data.numeroPagina
        const numeroPagina = (numeroPagina_humano) => {
            if (numeroPagina_humano === 1) {
                return 0
            } else {
                return (numeroPagina_humano - 1) * 10
            }
        }

        const nombreColumna = data.nombreColumna
        const terminoBusqueda = data.terminoBusqueda
        const sentidoColumna = data.sentidoColumna

        const terminoBuscar = terminoBusqueda.split(" ");
        const terminosFormateados = [];
        terminoBuscar.forEach((termino) => {
            const terminoFinal = "%" + termino + "%";
            terminosFormateados.push(terminoFinal);
        });

        const sqlDinamicoConstructor = (nombreColumna, sentidoColumna) => {
            if (sentidoColumna !== "descendente" && sentidoColumna !== "ascendente") {
                sentidoColumna = "descendente";
            }
            if (sentidoColumna == "ascendente") {
                sentidoColumna = "ASC";
            }
            if (sentidoColumna == "descendente") {
                sentidoColumna = "DESC";
            }

            if (nombreColumna === "nombre") {
                return `, (SELECT nombre
                    FROM "inventarioGeneral"
                    WHERE "inventarioGeneral"."UID" = "inventarioGeneralRegistro"."elementoUID") ${sentidoColumna}`;
            }
            if (nombreColumna) {
                return `,"${nombreColumna}" ${sentidoColumna}`;
            } else {
                return "DESC"
            }
        }

        const consultaConstructor = `    
            SELECT
            uid,
            "elementoUID",
            (SELECT nombre
            FROM "inventarioGeneral"
            WHERE "inventarioGeneral"."UID" = "inventarioGeneralRegistro"."elementoUID") AS "nombre",
            "cantidadEnMovimiento",
            "operacionIDV",
            fecha,
            "sentidoMovimiento",
            COUNT(*) OVER() as "totalElementos"
        FROM "inventarioGeneralRegistro"
        WHERE  
            (
            LOWER(COALESCE("sentidoMovimiento"::TEXT, '')) ILIKE ANY($1) OR
            LOWER(COALESCE("operacionIDV", '')) ILIKE ANY($1) OR
            COALESCE(CAST("cantidadEnMovimiento" AS TEXT), '') ILIKE ANY($1) OR
            "elementoUID"::TEXT ILIKE ANY($1) OR
            COALESCE(CAST("fecha" AS TEXT), '') ILIKE ANY($1) OR
            "elementoUID" IN (
            SELECT "UID"
            FROM "inventarioGeneral"
            WHERE LOWER(COALESCE(nombre, '')) ILIKE ANY($1)
      ) 
            )
        ORDER BY
            (
              CASE
                WHEN (
                  (LOWER(COALESCE("sentidoMovimiento"::TEXT, '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("operacionIDV", '')) ILIKE ANY($1))::int +
                  (COALESCE(CAST("cantidadEnMovimiento" AS TEXT), '') ILIKE ANY($1))::int +
                  ("elementoUID" IN (
                    SELECT "UID"
                    FROM "inventarioGeneral"
                    WHERE LOWER(COALESCE(nombre, '')) ILIKE ANY($1)
                    ))::int + 
                  (COALESCE(CAST(fecha AS TEXT), '') ILIKE ANY($1))::int
                ) = 1 THEN 1
                WHEN (
                  (LOWER(COALESCE("sentidoMovimiento"::TEXT, '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("operacionIDV", '')) ILIKE ANY($1))::int +
                  (COALESCE(CAST("cantidadEnMovimiento" AS TEXT), '') ILIKE ANY($1))::int +
                  ("elementoUID" IN (
                    SELECT "UID"
                    FROM "inventarioGeneral"
                    WHERE LOWER(COALESCE(nombre, '')) ILIKE ANY($1)
                    ))::int +
                  (COALESCE(CAST(fecha AS TEXT), '') ILIKE ANY($1))::int
                ) = 3 THEN 3
                ELSE 2
              END
            ) 
       ${sqlDinamicoConstructor(nombreColumna, sentidoColumna)}
        LIMIT $2 OFFSET $3;`;

        const resuelve = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina(numeroPagina_humano)]);
        resuelve.rows.forEach(elemento => {
            delete elemento.testingVI
        })
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}