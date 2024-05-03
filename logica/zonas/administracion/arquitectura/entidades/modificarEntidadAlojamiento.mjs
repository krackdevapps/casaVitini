export const modificarEntidadAlojamiento = async (entrada, salida) => {
                    try {
                        const tipoEntidad = entrada.body.tipoEntidad;
                        const entidadIDV = entrada.body.entidadIDV;
                        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
                        const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;
                        const filtroCadenaMinusculasConEspacios = /^[a-z0-9\s]+$/i;
                        if (!tipoEntidad || !filtroCadenaMinusculasSinEspacios.test(tipoEntidad)) {
                            const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios";
                            throw new Error(error);
                        }
                        if (!entidadIDV || !filtroCadenaMinusculasSinEspacios.test(entidadIDV)) {
                            const error = "el campo 'entidadIDV' solo puede ser letras minúsculas, numeros y sin espacios";
                            throw new Error(error);
                        }
                        if (tipoEntidad === "apartamento") {
                            const apartamentoIDV = entrada.body.apartamentoIDV;
                            let apartamentoUI = entrada.body.apartamentoUI;
                            const caracteristicas = entrada.body.caracteristicas;
                            if (!apartamentoIDV || !filtroCadenaMinusculasMayusculasSinEspacios.test(apartamentoIDV) || apartamentoIDV.length > 50) {
                                const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres.";
                                throw new Error(error);
                            }
                            apartamentoUI = apartamentoUI.replace(/['"]/g, '');
                            /*
                            if (!apartamentoUI || !filtroCadenaMinusculasMayusculasYEspacios.test(apartamentoUI)) {
                                const error = "el campo 'apartamentoUI' solo puede ser letras minúsculas, mayúsculas, numeros y espacios"
                                throw new Error(error)
                            }
                            */
                            if (!Array.isArray(caracteristicas)) {
                                const error = "el campo 'caractaristicas' solo puede ser un array";
                                throw new Error(error);
                            }
                            const filtroCaracteristica = /^[a-zA-Z0-9\s.,:_\-\u00F1ñ]+$/u;
                            for (const caractaristica of caracteristicas) {
                                if (!filtroCaracteristica.test(caractaristica)) {
                                    const error = "Revisa las caracteristicas por que hay una que no cumple con el formato esperado. Recuerda que los campo de caracteristicas solo aceptan mayusculas, minusculas, numeros, espacios, puntos, comas, guion bajo y medio y nada mas";
                                    throw new Error(error);
                                }
                            }
                            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM apartamentos
                                    WHERE apartamento = $1
                                    `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe el apartamento, revisa el apartamentopIDV";
                                throw new Error(error);
                            }
                            // Comprobar que no existe el nuevo IDV
                            if (entidadIDV !== apartamentoIDV) {
                                const validarNuevoIDV = `
                                        SELECT 
                                        *
                                        FROM apartamentos
                                        WHERE apartamento = $1
                                        `;
                                const resuelveValidarNuevoIDV = await conexion.query(validarNuevoIDV, [apartamentoIDV]);
                                if (resuelveValidarNuevoIDV.rowCount === 1) {
                                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                                    throw new Error(error);
                                }
                            }
                            const guardarCambios = `
                                    UPDATE apartamentos
                                    SET 
                                    apartamento= COALESCE($1, apartamento),
                                    "apartamentoUI" = COALESCE($2, "apartamentoUI")
                                    WHERE apartamento = $3
                                    `;
                            const matrizCambios = [
                                apartamentoIDV,
                                apartamentoUI,
                                entidadIDV
                            ];
                            const resuelveGuardarCambios = await conexion.query(guardarCambios, matrizCambios);
                            if (resuelveGuardarCambios.rowCount === 0) {
                                const error = "No se ha podido guardar los datos por que no se han encontrado el apartamento";
                                throw new Error(error);
                            }
                            if (resuelveGuardarCambios.rowCount === 1) {
                                const eliminarEntidad = `
                                        DELETE FROM "apartamentosCaracteristicas"
                                        WHERE "apartamentoIDV" = $1;
                                        `;
                                await conexion.query(eliminarEntidad, [apartamentoIDV]);
                                if (caracteristicas.length > 0) {
                                    const insertarCaracteristicas = `
                                            INSERT INTO "apartamentosCaracteristicas" (caracteristica, "apartamentoIDV")
                                            SELECT unnest($1::text[]), $2
                                            `;
                                    await conexion.query(insertarCaracteristicas, [caracteristicas, apartamentoIDV]);
                                }
                                const ok = {
                                    ok: "Se ha actualizado correctamente el apartamento"
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "habitacion") {
                            const habitacionIDV = entrada.body.habitacionIDV;
                            let habitacionUI = entrada.body.habitacionUI;
                            if (!habitacionIDV || !filtroCadenaMinusculasMayusculasSinEspacios.test(habitacionIDV) || habitacionIDV.length > 50) {
                                const error = "el campo 'habitacionIDV' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres";
                                throw new Error(error);
                            }
                            habitacionUI = habitacionUI.replace(/['"]/g, '');
                            /*
                            if (!habitacionUI || !filtroCadenaMinusculasMayusculasYEspacios.test(habitacionUI)) {
                                const error = "el campo 'habitacionUI' solo puede ser letras mayúsculas, minúsculas, numeros y espacios"
                                throw new Error(error)
                            }
                            */
                            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM habitaciones
                                    WHERE habitacion = $1
                                    `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe la habitacion, revisa el habitacionIDV";
                                throw new Error(error);
                            }
                            // Comprobar que no existe el nuevo IDV
                            if (entidadIDV !== habitacionIDV) {
                                const validarNuevoIDV = `
                                        SELECT 
                                        *
                                        FROM habitaciones
                                        WHERE habitacion = $1
                                        `;
                                const resuelveValidarNuevoIDV = await conexion.query(validarNuevoIDV, [habitacionIDV]);
                                if (resuelveValidarNuevoIDV.rowCount === 1) {
                                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                                    throw new Error(error);
                                }
                            }
                            const guardarCambios = `
                                    UPDATE habitaciones
                                    SET 
                                    habitacion = COALESCE($1, habitacion),
                                    "habitacionUI" = COALESCE($2, "habitacionUI")
                                    WHERE habitacion = $3
                                    `;
                            const matrizCambios = [
                                habitacionIDV,
                                habitacionUI,
                                entidadIDV
                            ];
                            const resuelveGuardarCambios = await conexion.query(guardarCambios, matrizCambios);
                            if (resuelveGuardarCambios.rowCount === 0) {
                                const error = "No se ha podido guardar los datosd por que no se han encontrado la habitacion";
                                throw new Error(error);
                            }
                            if (resuelveGuardarCambios.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha actualizado correctamente la habitacion"
                                };
                                salida.json(ok);
                            }
                        }
                        if (tipoEntidad === "cama") {
                            const camaIDV = entrada.body.camaIDV;
                            let camaUI = entrada.body.camaUI;
                            let capacidad = entrada.body.capacidad;
                            if (!camaIDV || !filtroCadenaMinusculasMayusculasSinEspacios.test(camaIDV) || camaIDV.length > 50) {
                                const error = "el campo 'camaIDV' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres";
                                throw new Error(error);
                            }
                            camaUI = camaUI.replace(/['"]/g, '');
                            /*
                            if (!camaUI || !filtroCadenaMinusculasMayusculasYEspacios.test(camaUI)) {
                                const error = "el campo 'camaUI' solo puede ser letras minúsculas, mayúsculas, numeros y espacios"
                                throw new Error(error)
                            }
                            */
                            const filtroSoloNumeros = /^\d+$/;
                            if (filtroSoloNumeros.test(capacidad)) {
                                capacidad = parseInt(capacidad);
                            }
                            if (!capacidad || !Number.isInteger(capacidad) || capacidad < 0) {
                                const error = "el campo 'capacidad' solo puede ser numeros, entero y positivo";
                                throw new Error(error);
                            }
                            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM camas
                                    WHERE cama = $1
                                    `;
                            const resuelveValidarIDV = await conexion.query(validarIDV, [entidadIDV]);
                            if (resuelveValidarIDV.rowCount === 0) {
                                const error = "No existe la habitacion, revisa el habitacionIDV";
                                throw new Error(error);
                            }
                            // Comprobar que no existe el nuevo IDV
                            if (entidadIDV !== camaIDV) {
                                const validarNuevoIDV = `
                                        SELECT 
                                        *
                                        FROM camas
                                        WHERE cama = $1
                                        `;
                                const resuelveValidarNuevoIDV = await conexion.query(validarNuevoIDV, [camaIDV]);
                                if (resuelveValidarNuevoIDV.rowCount === 1) {
                                    const error = "El nuevo identificador de la entidad ya existe, escoge otro por favor";
                                    throw new Error(error);
                                }
                            }
                            const guardarCambios = `
                                    UPDATE camas
                                    SET 
                                    cama = COALESCE($1, cama),
                                    "camaUI" = COALESCE($2, "camaUI"),
                                    capacidad = COALESCE($3, "capacidad")
                                    WHERE cama = $4
                                    `;
                            const matrizCambios = [
                                camaIDV,
                                camaUI,
                                capacidad,
                                entidadIDV,
                            ];
                            const resuelveGuardarCambios = await conexion.query(guardarCambios, matrizCambios);
                            if (resuelveGuardarCambios.rowCount === 0) {
                                const error = "No se ha podido guardar los datosd por que no se han encontrado la cama";
                                throw new Error(error);
                            }
                            if (resuelveGuardarCambios.rowCount === 1) {
                                const ok = {
                                    ok: "Se ha actualizado correctamente la cama"
                                };
                                salida.json(ok);
                            }
                        }
                    } catch (errorCapturado) {
                        const error = {
                            error: errorCapturado.message
                        };
                        salida.json(error);
                    }
                }