import { conexion } from "../../componentes/db.mjs";

export const buscarUsuariosPorTermino = async (data) => {
    const terminosFormateados = data.terminosFormateados
    const numeroPorPagina = data.numeroPorPagina
    const numeroPagina = Number((data.numeroPagina - 1) + "0");
    const nombreColumna = data.nombreColumna
    const sentidoColumna = data.sentidoColumna

    const sentidoColumnaTraductor = (sentidoColumna) => {
        if (sentidoColumna === "ascendente") {
            return "ASC"
        }
        if (sentidoColumna === "descendente") {
            return "DESC"
        }
    }

    const constructorSQL = (nombreColumna, sentidoColumna) => {
        if (nombreColumna) {
            const sentidoColumnaSQL = sentidoColumnaTraductor(sentidoColumna)
            return `,"${nombreColumna}" ${sentidoColumnaSQL}`;
        } else {
            return ""
        }
    }

    try {
        const consulta = `    
        SELECT usuario, mail, nombre, "primerApellido", "segundoApellido", pasaporte, telefono,
        COUNT(*) OVER() as "totalUsuarios"
        FROM "datosDeUsuario"
        WHERE  
        (

        LOWER(COALESCE(usuario, '')) ILIKE ANY($1) OR
        LOWER(COALESCE(mail, '')) ILIKE ANY($1) OR
        LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1) OR
        LOWER(COALESCE(telefono, '')) ILIKE ANY($1) OR


        LOWER(COALESCE(nombre, '')) ILIKE ANY($1) OR
        LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1) OR
        LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1) OR
        LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1)
        )
        ORDER BY
        (
          CASE
            WHEN (

              (LOWER(COALESCE(usuario, '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE(mail, '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +

              (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
            ) = 1 THEN 1
            WHEN (


              (LOWER(COALESCE(usuario, '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE(mail, '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +

              (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
              (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
            ) = 3 THEN 3
            ELSE 2
          END
        ) DESC
        ${constructorSQL(nombreColumna, sentidoColumna)}
        LIMIT $2 OFFSET $3;`;
        const parametros = [
            terminosFormateados,
            numeroPorPagina,
            numeroPagina
        ]
        const resuelve = await conexion.query(consulta, parametros)
        return resuelve.rows
    } catch (errorCapturado) {
        throw errorCapturado;
    }
};
