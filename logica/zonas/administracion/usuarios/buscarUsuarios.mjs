import { conexion } from "../../../componentes/db.mjs";


export const buscarUsuarios = async (entrada, salida) => {
    try {
        const buscar = entrada.body.buscar;
        const nombreColumna = entrada.body.nombreColumna;
        let sentidoColumna = entrada.body.sentidoColumna;
        if (!buscar) {
            let error = "se tiene que espeficiar 'buscar' y lo que se desea buscar";
            throw new Error(error);
        }
        let Pagina = entrada.body.pagina;
        Pagina = Pagina ? Pagina : 1;
        if (typeof Pagina !== "number" || !Number.isInteger(Pagina) || Pagina <= 0) {
            const error = "En 'pagina' solo se aceptan numero enteros superiores a cero y positivos. Nada de decimales";
            throw new Error(error);
        }
        let condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = "";
        let nombreColumnaSentidoUI;
        let nombreColumnaUI;
        if (nombreColumna) {
            const filtronombreColumna = /^[a-zA-Z]+$/;
            if (!filtronombreColumna.test(nombreColumna)) {
                const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas.";
                throw new Error(error);
            }
            const consultaExistenciaNombreColumna = `
                                    SELECT column_name
                                    FROM information_schema.columns
                                    WHERE table_name = 'datosDeUsuario' AND column_name = $1;
                                    `;
            const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
            if (resuelveNombreColumna.rowCount === 0) {
                const error = "No existe el nombre de la columna que quieres ordenar";
                throw new Error(error);
            }
            // OJO con la coma, OJO LA COMA ES IMPORTANTISMA!!!!!!!!
            //!!!!!!!
            if (sentidoColumna !== "descendente" && sentidoColumna !== "ascendente") {
                sentidoColumna = "ascendente";
            }
            if (sentidoColumna == "ascendente") {
                sentidoColumna = "ASC";
                nombreColumnaSentidoUI = "ascendente";
            }
            if (sentidoColumna == "descendente") {
                sentidoColumna = "DESC";
                nombreColumnaSentidoUI = "descendente";
            }
            nombreColumnaUI = nombreColumna;
            condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = `,"${nombreColumna}" ${sentidoColumna}`;
        }
        const terminoBuscar = buscar.split(" ");
        const terminosFormateados = [];
        terminoBuscar.map((termino) => {
            const terminoFinal = "%" + termino + "%";
            terminosFormateados.push(terminoFinal);
        });
        const numeroPorPagina = 10;
        const numeroPagina = Number((Pagina - 1) + "0");
        const consultaConstructor = `    
                                SELECT "usuarioIDX", email, nombre, "primerApellido", "segundoApellido", pasaporte, telefono,
                                COUNT(*) OVER() as "totalUsuarios"
                                FROM "datosDeUsuario"
                                WHERE  
                                (
    
                                LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE(email, '')) ILIKE ANY($1) OR
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
    
                                      (LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(email, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(telefono, '')) ILIKE ANY($1))::int +
    
                                      (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                    ) = 1 THEN 1
                                    WHEN (
    
    
                                      (LOWER(COALESCE("usuarioIDX", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(email, '')) ILIKE ANY($1))::int +
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
                                ${condicionComplejaSQLOrdenarResultadosComoSegundaCondicion}
                            LIMIT $2 OFFSET $3;`;
        const consultaUsuarios = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina]);
        const usuariosEncontrados = consultaUsuarios.rows;
        const consultaConteoTotalFilas = usuariosEncontrados[0]?.totalUsuarios ? usuariosEncontrados[0].totalUsuarios : 0;
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(numeroPagina).replace("0", "");
        const Respuesta = {
            buscar: buscar,
            totalUsuarios: consultaConteoTotalFilas,
            nombreColumna: nombreColumna,
            paginasTotales: totalPaginas,
            pagina: Number(corretorNumeroPagina) + 1,
        };
        if (nombreColumna) {
            Respuesta.nombreColumna;
            Respuesta.sentidoColumna = nombreColumnaSentidoUI;
        }
        usuariosEncontrados.map((detallesUsuario) => {
            delete detallesUsuario.totalUsuarios;
        });
        Respuesta.usuarios = usuariosEncontrados;
        salida.json(Respuesta);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        return salida.json(error);
    } finally {
    }
}