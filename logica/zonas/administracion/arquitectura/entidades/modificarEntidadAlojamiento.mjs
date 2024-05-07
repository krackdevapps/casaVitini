
import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const modificarEntidadAlojamiento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const tipoEntidad = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoEntidad,
            nombreCampo: "El tipoEntidad",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const entidadIDV = validadoresCompartidos.tipos.cadena({
            string: entrada.body.entidadIDV,
            nombreCampo: "El entidadIDV",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })


        const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;

        if (tipoEntidad === "apartamento") {
            const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoIDV,
                nombreCampo: "El apartamentoIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })
            const apartamentoUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.apartamentoUI,
                nombreCampo: "El campo del apartamentoUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "si",
                limpiezaEspaciosAlrededor: "si",
            })
            const caracteristicas = entrada.body.caracteristicas;

            if (!Array.isArray(caracteristicas)) {
                const error = "el campo 'caractaristicas' solo puede ser un array";
                throw new Error(error);
            }
            for (const caractaristica of caracteristicas) {
                const caractaristica_ = validadoresCompartidos.tipos.cadena({
                    string: caractaristica,
                    nombreCampo: "El campo caracteristicas",
                    filtro: "strictoConEspacios",
                    sePermiteVacio: "si",
                    limpiezaEspaciosAlrededor: "si",
                })
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

            const habitacionIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.habitacionIDV,
                nombreCampo: "El habitacionIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })
            const habitacionUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.habitacionUI,
                nombreCampo: "El campo habitacionUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "si",
                limpiezaEspaciosAlrededor: "si",
            })

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
            const camaIDV = validadoresCompartidos.tipos.cadena({
                string: entrada.body.camaIDV,
                nombreCampo: "El camaIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                soloMinusculas: "si"
            })
            const camaUI = validadoresCompartidos.tipos.cadena({
                string: entrada.body.camaUI,
                nombreCampo: "El campo del camaUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "si",
                limpiezaEspaciosAlrededor: "si",
            })


            const capacidad = validadoresCompartidos.tipos.cadena({
                string: entrada.body.capacidad,
                nombreCampo: "El campo capacidad",
                filtro: "cadenaConNumerosEnteros",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                devuelveUnTipoNumber: "si"
            })

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