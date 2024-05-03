export const apartamentosDisponiblesAdministracion = async (entrada, salida) => {
                try {
                    const fechaEntrada = entrada.body.entrada;
                    const fechaSalida = entrada.body.salida;
                    if (!fechaEntrada) {
                        const error = "falta definir el campo 'entrada'";
                        throw new Error(error);
                    }
                    if (!fechaSalida) {
                        const error = "falta definir el campo 'salida'";
                        throw new Error(error);
                    }
                    const filtroFecha = /^(?:(?:31(\/)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/)(?:0?[1,3-9]|1[0-2]))\2|(?:(?:0?[1-9])|(?:1[0-9])|(?:2[0-8]))(\/)(?:0?[1-9]|1[0-2]))\3(?:(?:19|20)[0-9]{2})$/;
                    if (!filtroFecha.test(fechaEntrada)) {
                        const error = "el formato fecha de entrada no esta correctametne formateado";
                        throw new Error(error);
                    }
                    if (!filtroFecha.test(fechaSalida)) {
                        const error = "el formato fecha de salida no esta correctametne formateado";
                        throw new Error(error);
                    }
                    const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO;
                    const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO;
                    const rol = entrada.session.rol;
                    const configuracionApartamentosPorRango = {
                        fechaEntrada_ISO: fechaEntrada_ISO,
                        fechaSalida_ISO: fechaSalida_ISO,
                        rol: rol,
                        origen: "administracion"
                    };
                    const transactor = await apartamentosPorRango(configuracionApartamentosPorRango);
                    if (transactor) {
                        const ok = {
                            ok: transactor
                        };
                        salida.json(ok);
                    }
                    salida.end();
                } catch (errorCapturado) {
                    const error = {
                        error: errorCapturado.message
                    };
                    salida.json(error);
                } finally {
                }
            }