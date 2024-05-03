export const obtenerSituacion = async (entrada, salida) => {
                try {
                    const apartamentosObjeto = {};
                    const estadoDisonible = "disponible";
                    const consultaEstadoApartamentos = `
                        SELECT 
                        "apartamentoIDV",
                        "estadoConfiguracion"
                        FROM 
                        "configuracionApartamento"
                        -- WHERE "estadoConfiguracion" = $1
                        ORDER BY "apartamentoIDV" ASC
                        `;
                    let resuelveConsultaEstadoApartamentos = await conexion.query(consultaEstadoApartamentos);
                    if (resuelveConsultaEstadoApartamentos.rowCount === 0) {
                        const error = "No hay apartamentos configurados";
                        throw new Error(error);
                    }
                    resuelveConsultaEstadoApartamentos = resuelveConsultaEstadoApartamentos.rows;
                    for (const apartamento of resuelveConsultaEstadoApartamentos) {
                        const apartamentoIDV = apartamento.apartamentoIDV;
                        const estadoApartamento = apartamento.estadoConfiguracion;
                        const apartamentoUI = await resolverApartamentoUI(apartamentoIDV);
                        apartamentosObjeto[apartamentoIDV] = {
                            apartamentoUI: apartamentoUI,
                            estadoApartamento: estadoApartamento,
                            reservas: [],
                            estadoPernoctacion: "libre"
                        };
                    }
                    const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
                    const tiempoZH = DateTime.now().setZone(zonaHoraria);
                    const fechaActualCompletaTZ = tiempoZH.toISO();
                    const fechaActualTZ = tiempoZH.toISODate();
                    const fechaActualUTC = DateTime.now().toUTC().toISODate();
                    const diaHoyTZ = tiempoZH.day;
                    const mesPresenteTZ = tiempoZH.month;
                    const anoPresenteTZ = tiempoZH.year;
                    const horaPresenteTZ = tiempoZH.hour;
                    const minutoPresenteTZ = tiempoZH.minute;
                    const consultaReservasHoy = `
                        SELECT 
                        reserva, 
                        to_char(entrada, 'YYYY-MM-DD') as "fechaEntrada_ISO", 
                        to_char(salida, 'YYYY-MM-DD') as "fechaSalida_ISO",
                        to_char(entrada, 'DD/MM/YYYY') as "entradaHumano", 
                        to_char(salida, 'DD/MM/YYYY') as "salidaHumano"
                        FROM reservas
                        WHERE (entrada <= $1::DATE AND salida >= $1::DATE) AND "estadoReserva" <> $2; 
                        `;
                    const resuelveConsultaReservasHoy = await conexion.query(consultaReservasHoy, [fechaActualTZ, "cancelada"]);
                    const ok = {};
                    if (resuelveConsultaReservasHoy.rowCount === 0) {
                        ok.ok = apartamentosObjeto;
                    }
                    if (resuelveConsultaReservasHoy.rowCount > 0) {
                        const reservasHoy = resuelveConsultaReservasHoy.rows;
                        const horasSalidaEntrada = await componentes.administracion.reservas.horasSalidaEntrada();
                        const horaEntradaTZ = horasSalidaEntrada.horaEntradaTZ;
                        const horaSalidaTZ = horasSalidaEntrada.horaSalidaTZ;
                        //ok.fechaUTC = fechaActualUTC;
                        ok.fechaTZ = `${diaHoyTZ}/${mesPresenteTZ}/${anoPresenteTZ}`;
                        ok.horaTZ = `${horaPresenteTZ}:${minutoPresenteTZ}`;
                        ok.horaEntrada = horaEntradaTZ;
                        ok.horaSalida = horaSalidaTZ;
                        for (const reservaDetalles of reservasHoy) {
                            const reservaUID = reservaDetalles.reserva;
                            // Fecha de la base de datos
                            const fechaEntradaReservaISO = reservaDetalles.fechaEntrada_ISO;
                            const fechaSalidaReservaISO = reservaDetalles.fechaSalida_ISO;
                            const fechaEntradaReservaHumano = reservaDetalles.entradaHumano;
                            const fechaSalidaReservaHumano = reservaDetalles.salidaHumano;
                            // Formatos fecha
                            const fechaConHoraEntradaFormato_ISO_ZH = DateTime.fromISO(`${fechaEntradaReservaISO}T${horaEntradaTZ}`, { zone: zonaHoraria }).toISO();
                            const fechaConHoraSalidaFormato_ISO_ZH = DateTime.fromISO(`${fechaSalidaReservaISO}T${horaSalidaTZ}`, { zone: zonaHoraria }).toISO();
                            const consultaApartamentos = `
                                SELECT 
                                apartamento
                                FROM 
                                "reservaApartamentos"
                                WHERE 
                                reserva = $1;`;
                            const resuelveConsultaApartamentos = await conexion.query(consultaApartamentos, [reservaUID]);
                            if (resuelveConsultaApartamentos.rowCount > 0) {
                                const apartamentosResueltos = resuelveConsultaApartamentos.rows;
                                apartamentosResueltos.map((apartamento) => {
                                    if (apartamentosObjeto[apartamento.apartamento]) {
                                        apartamentosObjeto[apartamento.apartamento].estadoPernoctacion = "ocupado";
                                    }
                                    const tiempoRestante = utilidades.calcularTiempoRestanteEnFormatoISO(fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                                    const cantidadDias = utilidades.calcularDiferenciaEnDias(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH);
                                    const porcentajeTranscurrido = utilidades.calcularPorcentajeTranscurridoUTC(fechaConHoraEntradaFormato_ISO_ZH, fechaConHoraSalidaFormato_ISO_ZH, fechaActualCompletaTZ);
                                    let porcentajeFinal = porcentajeTranscurrido;
                                    if (porcentajeTranscurrido >= 100) {
                                        porcentajeFinal = "100";
                                    }
                                    if (porcentajeTranscurrido <= 0) {
                                        porcentajeFinal = "0";
                                    }
                                    const diaEntrada = utilidades.comparadorFechasStringDDMMAAAA(fechaEntradaReservaISO, fechaActualTZ);
                                    const diaSalida = utilidades.comparadorFechasStringDDMMAAAA(fechaSalidaReservaISO, fechaActualTZ);
                                    let identificadoDiaLimite = "diaInterno";
                                    if (diaEntrada) {
                                        identificadoDiaLimite = "diaDeEntrada";
                                    }
                                    if (diaSalida) {
                                        identificadoDiaLimite = "diaDeSalida";
                                    }
                                    let numeroDiaReservaUI;
                                    if (cantidadDias.diasDiferencia > 1) {
                                        numeroDiaReservaUI = cantidadDias.diasDiferencia.toFixed(0) + " días";
                                    }
                                    if (cantidadDias.diasDiferencia === 1) {
                                        numeroDiaReservaUI = cantidadDias.diasDiferencia.toFixed(0) + " día y " + cantidadDias.horasDiferencia.toFixed(0) + " horas";
                                    }
                                    if (cantidadDias.diasDiferencia === 0) {
                                        if (cantidadDias.horasDiferencia > 1) {
                                            numeroDiaReservaUI = cantidadDias.horasDiferencia.toFixed(0) + " horas";
                                        }
                                        if (cantidadDias.horasDiferencia === 1) {
                                            numeroDiaReservaUI = cantidadDias.horasDiferencia.toFixed(0) + " hora";
                                        }
                                        if (cantidadDias.horasDiferencia === 0) {
                                            numeroDiaReservaUI = "menos de una hora";
                                        }
                                    }
                                    const detalleReservaApartamento = {
                                        reserva: reservaUID,
                                        diaLimite: identificadoDiaLimite,
                                        fechaEntrada: fechaEntradaReservaHumano,
                                        fechaSalida: fechaSalidaReservaHumano,
                                        porcentajeTranscurrido: porcentajeFinal + '%',
                                        tiempoRestante: tiempoRestante,
                                        numeroDiasReserva: numeroDiaReservaUI
                                    };
                                    if (apartamentosObjeto[apartamento.apartamento]) {
                                        apartamentosObjeto[apartamento.apartamento].reservas.push(detalleReservaApartamento);
                                    }
                                });
                            }
                        }
                        ok.ok = apartamentosObjeto;
                    }
                    // buscar reservas en el dia actual
                    const eventosCalendarios_airbnb = await apartamentosOcupadosHoy_paraSitaucion(fechaActualTZ);


                    for (const calendariosSincronizadosAirbnb of eventosCalendarios_airbnb) {
                        /*
                        {
                              apartamentoIDV: 'apartamento3',
                              eventos: [
                                {
                                  fechaFinal: '2024-03-31',
                                  fechaInicio: '2024-03-27',
                                  uid: '6fec1092d3fa-51854b16859896e37a57944c187c806c@airbnb.com',
                                  nombreEvento: 'Airbnb (Not available)'
                                }
                              ]
                            }
                        */
                        const apartamentoIDV_destino = calendariosSincronizadosAirbnb.apartamentoIDV;
                        const eventosDelApartamento = calendariosSincronizadosAirbnb.eventos;



                        ok.ok[apartamentoIDV_destino].calendariosSincronizados = {};
                        ok.ok[apartamentoIDV_destino].calendariosSincronizados.airbnb = {};
                        ok.ok[apartamentoIDV_destino].calendariosSincronizados.airbnb.eventos = eventosDelApartamento;
                        ok.ok[apartamentoIDV_destino].estadoPernoctacion = "ocupado";

                    }
                    salida.json(ok);
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                }
            }