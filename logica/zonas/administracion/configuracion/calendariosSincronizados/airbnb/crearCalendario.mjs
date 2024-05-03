export const crearCalendario = async (entrada, salida) => {
                        try {
                            let nombre = entrada.body.nombre;
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            const url = entrada.body.url;
                            const filtroCadenaIDV = /^[a-z0-9]+$/;
                            const filtroCadenaUI = /^[a-zA-Z0-9\s]+$/;
                            const filtroURL = /^https:\/\/[^\s/$.?#].[^\s]*$/;
                            if (!nombre || !filtroCadenaUI.test(nombre)) {
                                const error = "Hay que definir el nombre solo se admiten minusculas, mayusculas, numeros y espacios";
                                throw new Error(error);
                            }
                            nombre = nombre.trim();
                            if (!apartamentoIDV || !filtroCadenaIDV.test(apartamentoIDV)) {
                                const error = "Hay que definir el apartamentoIDV solo se admiten minusculas, numeros y espacios";
                                throw new Error(error);
                            }
                            if (!url || !filtroURL.test(url)) {
                                const error = "Hay que definir el url y que esta cumpla el formato de url";
                                throw new Error(error);
                            }
                            if (!validator.isURL(url)) {
                                const error = "La url no cumple con el formato esperado, por favor revisa la url";
                                throw new Error(error);
                            }
                            // Tambien hay que validar que exista el apartmentoIDV, que no esta hecho
                            const validarApartamentoIDV = `
                                    SELECT
                                    "apartamentoIDV"
                                    FROM 
                                    "configuracionApartamento"
                                    WHERE
                                    "apartamentoIDV" = $1`;
                            const resuelveValidarCliente = await conexion.query(validarApartamentoIDV, [apartamentoIDV]);
                            if (resuelveValidarCliente.rowCount === 0) {
                                const error = "No existe el identificador de apartamento, verifica el apartamentoIDV";
                                throw new Error(error);
                            }
                            const controlDominio = new URL(url);
                            const dominiofinal = controlDominio.hostname;
                            if (dominiofinal !== "www.airbnb.com" && dominiofinal !== "airbnb.com") {
                                const error = "La url o el dominio no son los esperados. Revisa el formato de la url y el dominio. Solo se acepta el dominio airbnb.com";
                                throw new Error(error);
                            }
                            const errorDeFormado = "En la direccion URL que has introducido no hay un calendario iCal de Airbnb";
                            let calendarioRaw;
                            try {
                                const maxContentLengthBytes = 10 * 1024 * 1024; // 10 MB
                                const calendarioData = await axios.get(url, {
                                    maxContentLength: maxContentLengthBytes,
                                }); calendarioRaw = calendarioData.data;
                                const jcalData = ICAL.parse(calendarioRaw); // Intenta analizar el contenido como datos jCal
                                const jcal = new ICAL.Component(jcalData); // Crea un componente jCal


                                // Verifica si el componente es un calendario (VCALENDAR)
                                if (jcal?.name.toLowerCase() !== 'vcalendar') {
                                    throw new Error(errorDeFormado);
                                }
                            } catch (errorCapturado) {
                                throw new Error(errorDeFormado);
                            }
                            const generarCadenaAleatoria = (longitud) => {
                                const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
                                let cadenaAleatoria = '';
                                for (let i = 0; i < longitud; i++) {
                                    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
                                    cadenaAleatoria += caracteres.charAt(indiceAleatorio);
                                }
                                return cadenaAleatoria + ".ics";
                            };
                            const validarCodigo = async (codigoAleatorio) => {
                                const validarCodigoAleatorio = `
                                        SELECT
                                        "uidPublico"
                                        FROM "calendariosSincronizados"
                                        WHERE "uidPublico" = $1;`;
                                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [codigoAleatorio]);
                                if (resuelveValidarCodigoAleatorio.rowCount > 0) {
                                    return true;
                                }
                            };
                            const controlCodigo = async () => {
                                const longitudCodigo = 100; // Puedes ajustar la longitud según tus necesidades
                                let codigoGenerado;
                                let codigoExiste;
                                do {
                                    codigoGenerado = generarCadenaAleatoria(longitudCodigo);
                                    codigoExiste = await validarCodigo(codigoGenerado);
                                } while (codigoExiste);
                                // En este punto, tenemos un código único que no existe en la base de datos
                                return codigoGenerado;
                            };
                            const codigoAleatorioUnico = await controlCodigo();
                            const plataformaOrigen = "airbnb";
                            const consultaConfiguracion = `
                                    INSERT INTO "calendariosSincronizados"
                                    (
                                    nombre,
                                    url,
                                    "apartamentoIDV",
                                    "plataformaOrigen",
                                    "dataIcal", 
                                    "uidPublico"
                                    )
                                    VALUES ($1, $2, $3, $4, $5, $6)
                                    RETURNING uid
                                        `;
                            const nuevoCalendario = [
                                nombre,
                                url,
                                apartamentoIDV,
                                plataformaOrigen,
                                calendarioRaw,
                                codigoAleatorioUnico
                            ];
                            const resuelveCalendariosSincronizados = await conexion.query(consultaConfiguracion, nuevoCalendario);
                            const nuevoUID = resuelveCalendariosSincronizados.rows[0].uid;
                            const ok = {
                                ok: "Se ha guardado el nuevo calendario y esta listo para ser sincronizado",
                                nuevoUID: nuevoUID
                            };
                            salida.json(ok);
                        } catch (errorCapturado) {
                            const error = {
                                error: errorCapturado.message
                            };
                            salida.json(error);
                        }

                    }