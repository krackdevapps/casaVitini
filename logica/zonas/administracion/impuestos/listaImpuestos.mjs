export const listaImpuestos = async (entrada, salida) => {
                try {
                    /*
                    "totalReservas": 16,
                    "paginasTotales": 2,
                    "pagina": 1,
                    "nombreColumna": "entrada",
                    "sentidoColumna": "descendente",
                    */
                    const validadores = {
                        nombreColumna: async (nombreColumna) => {
                            const filtronombreColumna = /^[a-zA-Z]+$/;
                            if (!filtronombreColumna.test(nombreColumna)) {
                                const error = "el campo 'ordenClolumna' solo puede ser letras minúsculas y mayúsculas.";
                                throw new Error(error);
                            }
                            const consultaExistenciaNombreColumna = `
                                    SELECT column_name
                                    FROM information_schema.columns
                                    WHERE table_name = 'impuestos' AND column_name = $1;
                                    `;
                            const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
                            if (resuelveNombreColumna.rowCount === 0) {
                                const miArray = [
                                    'nombreCompleto',
                                    'pasaporteTitular',
                                    'emailTitular'
                                ];
                                if (!miArray.includes(nombreColumna)) {
                                    const error = "No existe el nombre de la columna que quieres ordenar";
                                    throw new Error(error);
                                }
                            }
                        },
                        sentidoColumna: (sentidoColumna) => {
                            let sentidoColumnaSQL;
                            const sentidoColumnaPreVal = sentidoColumna;
                            if (sentidoColumnaPreVal !== "descendente" && sentidoColumnaPreVal !== "ascendente") {
                                const error = "El sentido del ordenamiento de la columna es ascendente o descendente";
                                throw new Error(error);
                            }
                            if (sentidoColumnaPreVal === "ascendente") {
                                sentidoColumnaSQL = "ASC";
                            }
                            if (sentidoColumnaPreVal === "descendente") {
                                sentidoColumnaSQL = "DESC";
                            }
                            const estructuraFinal = {
                                sentidoColumna: sentidoColumnaPreVal,
                                sentidoColumnaSQL: sentidoColumnaSQL
                            };
                            return estructuraFinal;
                        }
                    };
                    // Si hay nombre columna que halla sentido
                    let nombreColumna = entrada.body.nombreColumna;
                    let sentidoColumna = entrada.body.sentidoColumna;
                    const pagina = entrada.body.pagina;
                    if (typeof pagina !== "number" || !Number.isInteger(pagina) || pagina <= 0) {
                        const error = "Debe de especificarse la clave 'pagina' y su valor debe de ser numerico, entero, positivo y mayor a cero.";
                        throw new Error(error);
                    }
                    const numeroPagina = Number((pagina - 1) + "0");
                    let ordenamientoFinal;
                    const ok = {};
                    if (nombreColumna || sentidoColumna) {
                        await validadores.nombreColumna(nombreColumna);
                        const sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL;
                        sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna;
                        ordenamientoFinal = `
                                ORDER BY 
                                "${nombreColumna}" ${sentidoColumnaSQL}
                                `;
                        ok.nombreColumna = nombreColumna;
                        ok.sentidoColumna = sentidoColumna;
                    } else {
                        ordenamientoFinal = "";
                    }
                    const numeroPorPagina = 10;
                    // si hay nombre columna validarlo
                    const listarImpuestos = `
                            SELECT
                            "impuestoUID",
                            nombre,
                            "tipoImpositivo",
                            "tipoValor",
                            "aplicacionSobre",
                            estado,
                            COUNT(*) OVER() as total_filas
                            FROM 
                            impuestos
                            ${ordenamientoFinal}
                            LIMIT $1
                            OFFSET $2;  
                            `;
                    const resuelvelistarImpuestos = await conexion.query(listarImpuestos, [numeroPorPagina, numeroPagina]);
                    if (resuelvelistarImpuestos.rowCount === 0) {
                        const error = "No hay ningun impuesto en sl sistema";
                        // throw new Error(error)
                    }
                    const consultaConteoTotalFilas = resuelvelistarImpuestos?.rows[0]?.total_filas ? resuelvelistarImpuestos.rows[0].total_filas : 0;
                    const impuestosEncontradoas = resuelvelistarImpuestos.rows;
                    const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                    for (const detallesFila of impuestosEncontradoas) {
                        delete detallesFila.total_filas;
                    }
                    if (nombreColumna) {
                        ok.nombreColumna = nombreColumna;
                        ok.sentidoColumna = sentidoColumna;
                    }
                    ok.totalImpuestos = Number(consultaConteoTotalFilas);
                    ok.paginasTotales = totalPaginas;
                    ok.pagina = pagina;
                    ok.impuestos = impuestosEncontradoas;
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                }
            }