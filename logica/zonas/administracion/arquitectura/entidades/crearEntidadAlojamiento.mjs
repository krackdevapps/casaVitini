import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const crearEntidadAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return


        const tipoEntidad = entrada.body.tipoEntidad;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;
        const filtroCadenaMinusculasConEspacios = /^[a-zA-Z0-9\s]+$/;
        if (!tipoEntidad || !filtroCadenaMinusculasSinEspacios.test(tipoEntidad)) {
            const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios";
            throw new Error(error);
        }
        if (tipoEntidad === "apartamento") {
            let apartamentoIDV = entrada.body.apartamentoIDV;
            let apartamentoUI = entrada.body.apartamentoUI;
            apartamentoUI = apartamentoUI.replace(/['"]/g, '');
            if (!apartamentoUI || !filtroCadenaMinusculasConEspacios.test(apartamentoUI) || apartamentoUI.length > 50) {
                const error = "el campo 'apartamentoUI' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres";
                throw new Error(error);
            }
            if (!apartamentoIDV) {
                apartamentoIDV = apartamentoUI.toLowerCase().replace(/[^a-z0-9]/g, '');
            } else {
                apartamentoIDV = apartamentoIDV.toLowerCase().replace(/[^a-z0-9]/g, '');
            }
            const validarCodigo = async (apartamentoIDV) => {
                const validarCodigoAleatorio = `
                                        SELECT
                                        apartamento
                                        FROM apartamentos
                                        WHERE apartamento = $1;`;
                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [apartamentoIDV]);
                if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                    return true;
                }
            };
            const controlApartamentoIDV = async (apartamentoIDV) => {
                let codigoGenerado = apartamentoIDV;
                let codigoExiste;
                do {
                    codigoExiste = await validarCodigo(codigoGenerado);
                    if (codigoExiste) {
                        // Si el código ya existe, agrega un cero al final y vuelve a verificar
                        codigoGenerado = codigoGenerado + "0";
                    }
                } while (codigoExiste);
                return codigoGenerado;
            };
            apartamentoIDV = await controlApartamentoIDV(apartamentoIDV);
            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM apartamentos
                                    WHERE apartamento = $1
                                    `;
            const resuelveValidarIDV = await conexion.query(validarIDV, [apartamentoIDV]);
            if (resuelveValidarIDV.rowCount === 1) {
                const error = "Ya existe un identificador visual igual que el apartamento que propones, escoge otro";
                throw new Error(error);
            }
            const validarUI = `
                                    SELECT 
                                    *
                                    FROM apartamentos
                                    WHERE "apartamentoUI" = $1
                                    `;
            const resuelveValidarUI = await conexion.query(validarUI, [apartamentoUI]);
            if (resuelveValidarUI.rowCount === 1) {
                const error = "Ya existe un apartamento con ese nombre, por tema de legibilidad escoge otro";
                throw new Error(error);
            }
            const crearEntidad = `
                                    INSERT INTO apartamentos
                                    (
                                    apartamento,
                                    "apartamentoUI"
                                    )
                                    VALUES 
                                    (
                                    $1,
                                    $2
                                    )
                                    RETURNING apartamento
                                    `;
            const matriozDatosNuevaEntidad = [
                apartamentoIDV,
                apartamentoUI
            ];
            const resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad);
            if (resuelveCrearEntidad.rowCount === 0) {
                const error = "No se ha podido crear la nueva entidad";
                throw new Error(error);
            }
            if (resuelveCrearEntidad.rowCount === 1) {
                const ok = {
                    ok: "Se ha creado correctament la nuevo entidad como apartamento",
                    nuevoUID: resuelveCrearEntidad.rows[0].apartamento
                };
                salida.json(ok);
            }
        }
        if (tipoEntidad === "habitacion") {
            let habitacionIDV = entrada.body.habitacionIDV;
            let habitacionUI = entrada.body.habitacionUI;
            habitacionUI = habitacionUI.replace(/['"]/g, '');
            if (!habitacionUI || !filtroCadenaMinusculasConEspacios.test(habitacionUI) || habitacionUI.length > 50) {
                const error = "el campo 'habitacionUI' solo puede ser letras minúsculas, numeros y sin pesacios. No puede tener mas de 50 caracteres";
                throw new Error(error);
            }
            if (!habitacionIDV) {
                habitacionIDV = habitacionUI.replace(/[^a-z0-9]/g, '');
            } else {
                habitacionIDV = habitacionIDV.replace(/[^a-z0-9]/g, '');
            }
            const validarCodigo = async (habitacionIDV) => {
                const validarCodigoAleatorio = `
                                        SELECT
                                        *
                                        FROM habitaciones
                                        WHERE habitacion = $1;`;
                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [habitacionIDV]);
                if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                    return true;
                }
            };
            const controlHabitacionIDV = async (habitacionIDV) => {
                let codigoGenerado = habitacionIDV;
                let codigoExiste;
                do {
                    codigoExiste = await validarCodigo(codigoGenerado);
                    if (codigoExiste) {
                        // Si el código ya existe, agrega un cero al final y vuelve a verificar
                        codigoGenerado = codigoGenerado + "0";
                    }
                } while (codigoExiste);
                return codigoGenerado;
            };
            habitacionIDV = await controlHabitacionIDV(habitacionIDV);
            const validarIDV = `
                                    SELECT 
                                    *
                                    FROM habitaciones
                                    WHERE habitacion = $1
                                    `;
            const resuelveValidarIDV = await conexion.query(validarIDV, [habitacionIDV]);
            if (resuelveValidarIDV.rowCount === 1) {
                const error = "Ya existe un identificador visual igual que el que propones, escoge otro";
                throw new Error(error);
            }
            const validarUI = `
                                    SELECT 
                                    *
                                    FROM habitaciones
                                    WHERE "habitacionUI" = $1
                                    `;
            const resuelveValidarUI = await conexion.query(validarUI, [habitacionUI]);
            if (resuelveValidarUI.rowCount === 1) {
                const error = "Ya existe un nombre de la habitacion exactamente igual, por tema de legibilidad escoge otro";
                throw new Error(error);
            }
            const crearEntidad = `
                                    INSERT INTO habitaciones
                                    (
                                    habitacion,
                                    "habitacionUI"
                                    )
                                    VALUES 
                                    (
                                    $1,
                                    $2
                                    )
                                    RETURNING habitacion
                                    `;
            const matriozDatosNuevaEntidad = [
                habitacionIDV,
                habitacionUI,
            ];
            let resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad);
            if (resuelveCrearEntidad.rowCount === 0) {
                const error = "No se ha podido crear la nueva entidad";
                throw new Error(error);
            }
            if (resuelveCrearEntidad.rowCount === 1) {
                const ok = {
                    ok: "Se ha creado correctament la nuevo entidad como habitacion",
                    nuevoUID: resuelveCrearEntidad.rows[0].habitacion
                };
                salida.json(ok);
            }
        }
        if (tipoEntidad === "cama") {
            let camaIDV = entrada.body.camaIDV;
            let camaUI = entrada.body.camaUI;
            let capacidad = entrada.body.capacidad;
            camaUI = camaUI.replace(/['"]/g, '');
            if (!camaUI || !filtroCadenaMinusculasConEspacios.test(camaUI) || camaUI.length > 50) {
                const error = "el campo 'camaUI' solo puede ser letras minúsculas, numeros y sin espacios. No puede tener mas de 50 caracteres.";
                throw new Error(error);
            }
            if (!camaIDV) {
                camaIDV = camaUI.replace(/[^a-z0-9]/g, '');
            } else {
                camaIDV = camaIDV.replace(/[^a-z0-9]/g, '');
            }
            const validarCodigo = async (camaIDV) => {
                const validarCodigoAleatorio = `
                                        SELECT
                                        *
                                        FROM camas
                                        WHERE cama = $1;`;
                const resuelveValidarCodigoAleatorio = await conexion.query(validarCodigoAleatorio, [camaIDV]);
                if (resuelveValidarCodigoAleatorio.rowCount === 1) {
                    return true;
                }
            };
            const controlCamaIDV = async (camaIDV) => {
                let codigoGenerado = camaIDV;
                let codigoExiste;
                do {
                    codigoExiste = await validarCodigo(codigoGenerado);
                    if (codigoExiste) {
                        // Si el código ya existe, agrega un cero al final y vuelve a verificar
                        codigoGenerado = codigoGenerado + "0";
                    }
                } while (codigoExiste);
                return codigoGenerado;
            };
            camaIDV = await controlCamaIDV(camaIDV);
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
            const resuelveValidarIDV = await conexion.query(validarIDV, [camaIDV]);
            if (resuelveValidarIDV.rowCount === 1) {
                const error = "Ya existe un identificador visual igual que la cama que propones, escoge otro";
                throw new Error(error);
            }
            const validarUI = `
                                    SELECT 
                                    *
                                    FROM camas
                                    WHERE "camaUI" = $1
                                    `;
            const resuelveValidarUI = await conexion.query(validarUI, [camaUI]);
            if (resuelveValidarUI.rowCount === 1) {
                const error = "Ya existe una cama con ese nombre, por tema de legibilidad escoge otro";
                throw new Error(error);
            }
            const crearEntidad = `
                                    INSERT INTO camas
                                    (
                                    cama,
                                    "camaUI",
                                    capacidad
                                    )
                                    VALUES 
                                    (
                                    $1,
                                    $2,
                                    $3
                                    )
                                    RETURNING cama
                                    `;
            const matriozDatosNuevaEntidad = [
                camaIDV,
                camaUI,
                capacidad
            ];
            const resuelveCrearEntidad = await conexion.query(crearEntidad, matriozDatosNuevaEntidad);
            if (resuelveCrearEntidad.rowCount === 0) {
                const error = "No se ha podido crear la nueva entidad";
                throw new Error(error);
            }
            if (resuelveCrearEntidad.rowCount === 1) {
                const ok = {
                    ok: "Se ha creado correctament la nuevo entidad como cama",
                    nuevoUID: resuelveCrearEntidad.rows[0].cama
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