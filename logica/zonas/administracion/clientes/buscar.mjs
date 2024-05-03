export const buscar = async (entrada, salida) => {
                try {
                    let buscar = entrada.body.buscar;
                    let tipoBusqueda = entrada.body.tipoBusqueda;
                    let nombreColumna = entrada.body.nombreColumna;
                    let sentidoColumna = entrada.body.sentidoColumna;
                    if (tipoBusqueda !== "rapido") {
                        tipoBusqueda = null;
                    }
                    if (!buscar || typeof buscar !== "string") {
                        let error = "se tiene que espeficiar 'buscar' y lo que se desea buscar";
                        throw new Error(error);
                    }
                    let Pagina = entrada.body["pagina"];
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
                                WHERE table_name = 'clientes' AND column_name = $1;
                                `;
                        const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
                        if (resuelveNombreColumna.rowCount === 0) {
                            const error = "No existe el nombre de la columna en la tabla clientes";
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
                        // nombreColumnaUI = nombreColumna.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                        condicionComplejaSQLOrdenarResultadosComoSegundaCondicion = `,"${nombreColumna}" ${sentidoColumna}`;
                    }
                    const terminoBuscar = buscar.split(" ");
                    let terminosFormateados = [];
                    terminoBuscar.map((termino) => {
                        const terminoFinal = "%" + termino + "%";
                        terminosFormateados.push(terminoFinal);
                    });
                    const numeroPorPagina = 10;
                    const numeroPagina = Number((Pagina - 1) + "0");
                    const consultaConstructor = `    
                                SELECT *,
                                COUNT(*) OVER() as "totalClientes"
                            FROM clientes
                            WHERE  
                                (
                                LOWER(COALESCE(nombre, '')) ILIKE ANY($1) OR
                                LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1) OR
                                LOWER(COALESCE("email", '')) ILIKE ANY($1) OR
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
                                      (LOWER(COALESCE("email", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                    ) = 1 THEN 1
                                    WHEN (
                                      (LOWER(COALESCE(nombre, '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("primerApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("segundoApellido", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("email", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE("telefono", '')) ILIKE ANY($1))::int +
                                      (LOWER(COALESCE(pasaporte, '')) ILIKE ANY($1))::int
                                    ) = 3 THEN 3
                                    ELSE 2
                                  END
                                ) 
                                ${condicionComplejaSQLOrdenarResultadosComoSegundaCondicion}
                            LIMIT $2 OFFSET $3;`;
                    let consultaReservas = await conexion.query(consultaConstructor, [terminosFormateados, numeroPorPagina, numeroPagina]);
                    consultaReservas = consultaReservas.rows;
                    let consultaConteoTotalFilas = consultaReservas[0]?.totalClientes ? consultaReservas[0].totalClientes : 0;
                    if (tipoBusqueda === "rapido") {
                        consultaReservas.map((cliente) => {
                            delete cliente.Telefono;
                            delete cliente.email;
                            delete cliente.notas;
                        });
                    }
                    consultaReservas.map((cliente) => {
                        delete cliente.totalClientes;
                    });
                    const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                    const corretorNumeroPagina = String(numeroPagina).replace("0", "");
                    const Respuesta = {
                        buscar: buscar,
                        totalClientes: consultaConteoTotalFilas,
                        paginasTotales: totalPaginas,
                        pagina: Number(corretorNumeroPagina) + 1,
                    };
                    if (nombreColumna) {
                        Respuesta["nombreColumna"] = nombreColumna;
                        Respuesta["sentidoColumna"] = nombreColumnaSentidoUI;
                    }
                    Respuesta["clientes"] = consultaReservas;
                    salida.json(Respuesta);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    return salida.json(error);
                } finally {
                }
            }