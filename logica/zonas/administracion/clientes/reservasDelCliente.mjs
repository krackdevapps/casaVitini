export const reservasDelCliente = async (entrada, salida) => {
                try {
                    const cliente = entrada.body.cliente;
                    let nombreColumna = entrada.body.nombreColumna;
                    let sentidoColumna = entrada.body.sentidoColumna;
                    if (!cliente || !Number.isInteger(cliente) || cliente <= 0) {
                        const error = "El campo cliente solo puede ser un numero positivo y entero que haga referencia al UID del cliente";
                        throw new Error(error);
                    }
                    const pagina = entrada.body.pagina;
                    if (typeof pagina !== "number" || !Number.isInteger(pagina) || pagina <= 0) {
                        const error = "En 'pagina' solo se aceptan numero enteros superiores a cero y positivos. Nada de decimales";
                        throw new Error(error);
                    }
                    const validadores = {
                        nombreColumna: async (nombreColumna) => {
                            const filtronombreColumna = /^[a-zA-Z]+$/;
                            if (!filtronombreColumna.test(nombreColumna)) {
                                const error = "el campo 'nombreColumna' solo puede ser letras minúsculas y mayúsculas.";
                                throw new Error(error);
                            }
                            const consultaExistenciaNombreColumna = `
                                    SELECT column_name
                                    FROM information_schema.columns
                                    WHERE table_name = 'reservas' AND column_name = $1;
                                    `;
                            const resuelveNombreColumna = await conexion.query(consultaExistenciaNombreColumna, [nombreColumna]);
                            if (resuelveNombreColumna.rowCount === 0) {
                                const miArray = [
                                    'como'
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
                        },
                        validarFechaEntrada: (fecha) => {
                            const filtroFecha = /^(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}$/;
                            if (!filtroFecha.test(fecha)) {
                                const error = "La fecha de entrada no cumple el criterio de formato";
                                throw new Error(error);
                            }
                        },
                        validarFechaSalida: (fecha) => {
                            const filtroFecha = /^(0?[1-9]|[1-2][0-9]|3[0-1])\/(0?[1-9]|1[0-2])\/\d{4}$/;
                            if (!filtroFecha.test(fecha)) {
                                const error = "La fecha de salida no cumple el criterio de formato";
                                throw new Error(error);
                            }
                        }
                    };
                    let sentidoColumnaSQL;
                    if (nombreColumna) {
                        await validadores.nombreColumna(nombreColumna);
                        sentidoColumnaSQL = (validadores.sentidoColumna(sentidoColumna)).sentidoColumnaSQL;
                        sentidoColumna = (validadores.sentidoColumna(sentidoColumna)).sentidoColumna;
                    }
                    let ordenColumnaSQL = "";
                    if (nombreColumna) {
                        ordenColumnaSQL = `
                                        ORDER BY 
                                        "${nombreColumna}" ${sentidoColumnaSQL} 
                                        `;
                    }
                    const comoTitularPreProcesado = [];
                    const comoPernoctantePreProcesado = [];
                    const consultaComoTitular = `
                            SELECT 
                            "reservaUID"
                            FROM 
                            "reservaTitulares" 
                            WHERE 
                            "titularUID" = $1`;
                    const resuelveConsultaComoTitular = await conexion.query(consultaComoTitular, [cliente]);
                    if (resuelveConsultaComoTitular.rowCount > 0) {
                        const uidsComoTitular = resuelveConsultaComoTitular.rows;
                        uidsComoTitular.map((detallesReserva) => {
                            const uid = detallesReserva.reservaUID;
                            comoTitularPreProcesado.push(uid);
                        });
                    }
                    const consultaComoPernoctante = `
                            SELECT 
                            reserva
                            FROM 
                            "reservaPernoctantes" 
                            WHERE 
                            "clienteUID" = $1`;
                    const resuelveConsultaComoPernoctante = await conexion.query(consultaComoPernoctante, [cliente]);
                    if (resuelveConsultaComoPernoctante.rowCount > 0) {
                        const uidsComoPernoctante = resuelveConsultaComoPernoctante.rows;
                        uidsComoPernoctante.map((detallesReserva) => {
                            const reserva = detallesReserva.reserva;
                            comoPernoctantePreProcesado.push(reserva);
                        });
                    }
                    const encontrarRepetidosEliminar = (comoTitular, comoPernoctante) => {
                        // Crear conjuntos a partir de los arrays
                        const set1 = new Set(comoTitular);
                        const set2 = new Set(comoPernoctante);
                        // Encontrar la intersección (elementos comunes) entre los conjuntos
                        const comoAmbos = [...set1].filter((elemento) => set2.has(elemento));
                        // Eliminar los elementos repetidos de los arrays originales
                        comoTitular = comoTitular.filter((elemento) => !comoAmbos.includes(elemento));
                        comoPernoctante = comoPernoctante.filter((elemento) => !comoAmbos.includes(elemento));
                        // Concatenar los arrays originales y los elementos repetidos
                        const estructuraFinal = {
                            comoTitular: comoTitular,
                            comoPernoctante: comoPernoctante,
                            comoAmbos: comoAmbos,
                        };
                        return estructuraFinal;
                    };
                    const reservasEstructuradas = encontrarRepetidosEliminar(comoTitularPreProcesado, comoPernoctantePreProcesado);
                    const UIDSreservasComoTitular = reservasEstructuradas.comoTitular;
                    const UIDSreservasComoPernoctante = reservasEstructuradas.comoPernoctante;
                    const UIDSreservasComoAmbos = reservasEstructuradas.comoAmbos;
                    const numeroPaginaSQL = Number((pagina - 1) + "0");
                    const reservasClasificadas = [];
                    const numeroPorPagina = 10;
                    const consultaFusionada = `
                            WITH resultados AS (
                                SELECT 
                                    'Titular' AS como,
                                    reserva::text,
                                    to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                    to_char(salida, 'DD/MM/YYYY') as salida
                                FROM 
                                    reservas 
                                WHERE 
                                    reserva = ANY($1)
    
                                UNION ALL
    
                                SELECT 
                                    'Pernoctante' AS como,
                                    reserva::text,
                                    to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                    to_char(salida, 'DD/MM/YYYY') as salida
                                FROM 
                                    reservas 
                                WHERE 
                                    reserva = ANY($2)
    
                                UNION ALL
    
                                SELECT 
                                    'Ambos' AS como,
                                    reserva::text,
                                    to_char(entrada, 'DD/MM/YYYY') as entrada, 
                                    to_char(salida, 'DD/MM/YYYY') as salida
                                FROM 
                                    reservas 
                                WHERE 
                                    reserva = ANY($3)                   
                            )
                            SELECT 
                                como,
                                reserva,
                                entrada,
                                salida,
                                COUNT(*) OVER ()::text as total_filas
                                -- ROW_NUMBER() OVER (PARTITION BY reserva ORDER BY reserva) as fila_duplicada
                            FROM resultados
                            ${ordenColumnaSQL}
                            LIMIT $4 OFFSET $5;
    
                            `;
                    const parametrosConsulta = [
                        UIDSreservasComoTitular,
                        UIDSreservasComoPernoctante,
                        UIDSreservasComoAmbos,
                        numeroPorPagina,
                        numeroPaginaSQL
                    ];
                    const resuelveConsulta = await conexion.query(consultaFusionada, parametrosConsulta);
                    if (resuelveConsulta.rowCount > 0) {
                        reservasClasificadas.push(...resuelveConsulta.rows);
                    }
                    const consultaConteoTotalFilas = resuelveConsulta.rows[0]?.total_filas ? resuelveConsulta.rows[0].total_filas : 0;
                    for (const detallesFila of reservasClasificadas) {
                        delete detallesFila.total_filas;
                    }
                    const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
                    const estructuraFinal = {
                        ok: "Reservas del cliente encontradas",
                        totalReservas: Number(consultaConteoTotalFilas),
                        paginasTotales: totalPaginas,
                        pagina: pagina,
                        nombreColumna: nombreColumna,
                        sentidoColumna: sentidoColumna,
                        reservas: reservasClasificadas
                    };
                    salida.json(estructuraFinal);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                }
            }