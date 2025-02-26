import { conexion } from "../globales/db.mjs";

export const obtenerResultadosBusqueda = async (data) => {
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
            if (nombreColumna) {

                return `,"${nombreColumna}" ${sentidoColumna}`;
            } else {
                return "DESC"
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
                  (LOWER(COALESCE(mail, '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                ) = 1 THEN 1
                WHEN (
                  (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE(mail, '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +
                  (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                ) = 3 THEN 3
                ELSE 2
              END
            ) 
        ${sqlDinamicoConstructor(nombreColumna, sentidoColumna)}
        LIMIT $2 OFFSET $3;`;

        const resuelve = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina(numeroPagina_humano)]);
        resuelve.rows.forEach(cliente => {
            delete cliente.testingVI
        })
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado
    }
}