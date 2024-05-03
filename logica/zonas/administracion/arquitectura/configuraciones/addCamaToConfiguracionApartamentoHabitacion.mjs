import { conexion } from "../../../../componentes/db.mjs";
export const addCamaToConfiguracionApartamentoHabitacion = async (entrada, salida) => {
    try {
        const camaIDV = entrada.body.camaIDV;
        const habitacionUID = entrada.body.habitacionUID;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        if (!camaIDV || !filtroCadenaMinusculasSinEspacios.test(camaIDV)) {
            const error = "el campo 'camaIDV' solo puede ser letras minúsculas, numeros y sin espacios";
            throw new Error(error);
        }
        if (!habitacionUID || !Number.isInteger(habitacionUID) || habitacionUID < 0) {
            const error = "el campo 'habitacionUID' solo puede ser numeros";
            throw new Error(error);
        }
        // validar la cama
        const consultaCamaIDV = `
                                SELECT
                                capacidad,
                                "camaUI", 
                                cama
                                FROM camas
                                WHERE cama = $1;
                                `;
        const resuelveConsultaCamaIDV = await conexion.query(consultaCamaIDV, [camaIDV]);
        if (resuelveConsultaCamaIDV.rowCount === 0) {
            const error = "No existe ninguna cama con ese identificador visual";
            throw new Error(error);
        }
        const camaUI = resuelveConsultaCamaIDV.rows[0].camaUI;
        const capacidad = resuelveConsultaCamaIDV.rows[0].capacidad;
        const consultaHabitacion = `
                                SELECT 
                                habitacion, apartamento
                                FROM "configuracionHabitacionesDelApartamento"
                                WHERE uid = $1;
                                `;
        const resuelveConsultaHabitacion = await conexion.query(consultaHabitacion, [habitacionUID]);
        if (resuelveConsultaHabitacion.rowCount === 0) {
            const error = "No hay ninguna habitacíon con ese UID";
            throw new Error(error);
        }
        if (resuelveConsultaHabitacion.rowCount === 1) {
            const apartamentoIDV = resuelveConsultaHabitacion.rows[0].apartamento;
            const consultaApartamento = `
                                    SELECT 
                                    "estadoConfiguracion"
                                    FROM "configuracionApartamento"
                                    WHERE "apartamentoIDV" = $1;
                                    `;
            const resuelveConsultaApartamento = await conexion.query(consultaApartamento, [apartamentoIDV]);
            if (resuelveConsultaApartamento.rows[0].estadoConfiguracion === "disponible") {
                const error = "No se puede anadir una habitacion cuando el estado de la configuracion es Disponible, cambie el estado a no disponible para realizar anadir una cama";
                throw new Error(error);
            }
            const habitacionIDV = resuelveConsultaHabitacion.rows[0].habitacion;
            const resuelveCamasEnHabitacion = await conexion.query(`SELECT cama FROM "configuracionCamasEnHabitacion" WHERE habitacion = $1 AND cama = $2 `, [habitacionUID, camaIDV]);
            if (resuelveCamasEnHabitacion.rowCount > 0) {
                const error = "Esta cama ya existe";
                throw new Error(error);
            }
            if (resuelveCamasEnHabitacion.rowCount === 0) {
                const insertarCamaEnHabitacion = `
                                        INSERT INTO "configuracionCamasEnHabitacion"
                                        (
                                        habitacion,
                                        cama
                                        )
                                        VALUES ($1, $2) RETURNING uid
                                        `;
                const resuelveInsertarHabitacion = await conexion.query(insertarCamaEnHabitacion, [habitacionUID, camaIDV]);
                if (resuelveInsertarHabitacion.rowCount === 0) {
                    const error = `Se han pasado las validaciones pero la base de datos no ha insertado el registro`;
                    throw new Error(error);
                }
                if (resuelveInsertarHabitacion.rowCount === 1) {
                    const nuevoUID = resuelveInsertarHabitacion.rows[0].uid;
                    const ok = {
                        ok: "Se ha insertardo la cama correctamente en la habitacion",
                        nuevoUID: nuevoUID,
                        camaUI: camaUI,
                        camaIDV: camaIDV,
                        capaciad: capacidad
                    };
                    salida.json(ok);
                }
            }
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}