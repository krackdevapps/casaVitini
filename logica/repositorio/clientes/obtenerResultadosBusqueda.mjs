import { conexion } from "../../componentes/db.mjs";

export const obtenerResultadosBusqueda = async (data) => {
    try {

        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = Number((data.numeroPagina - 1) + "0");
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
                sentidoColumna = "ascendente";
            }
            if (sentidoColumna == "ascendente") {
                sentidoColumna = "ASC";
            }
            if (sentidoColumna == "descendente") {
                sentidoColumna = "DESC";
            }
            if (nombreColumna) {
                // OJO con la coma, OJO LA COMA ES IMPORTANTISMA!!!!!!!!
                return `,"${nombreColumna}" ${sentidoColumna}`;
            } else {
                return ""
            }
        }

        const consultaConstructor = `    
            SELECT *,
            COUNT(*) OVER() as "totalClientes"
        FROM clientes
        WHERE  
            (
            LOWER(COALESCE(nombre, '')) ILIKE ANY($1) OR
            LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1) OR
            LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1) OR
            LOWER(COALESCE("mail", '')) ILIKE ANY($1) OR
            LOWER(COALESCE("telefono", '')) ILIKE ANY($1) OR
            LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1)
            )
        ORDER BY
            (
              CASE
                WHEN (
                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("mail", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                ) = 1 THEN 1
                WHEN (
                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("mail", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                ) = 3 THEN 3
                ELSE 2
              END
            ) 
        ${sqlDinamicoConstructor(nombreColumna, sentidoColumna)}
        LIMIT $2 OFFSET $3;`;

        const resuelve = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina]);
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}