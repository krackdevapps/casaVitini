import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const listarCamasDisponbilesApartamentoConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return



        const habitacionUID = validadoresCompartidos.tipos.numero({
            string: entrada.body.habitacionUID,
            nombreCampo: "El identificador universal de la habitación (habitacionUID)",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })     

        const validarHabitacionUID = `
                                SELECT 
                                habitacion
                                FROM "configuracionHabitacionesDelApartamento"
                                WHERE uid = $1;
                                `;
        const metadatos = [
            habitacionUID
        ];
        const resuelveConsultaDetallesConfiguracion = await conexion.query(validarHabitacionUID, metadatos);
        if (resuelveConsultaDetallesConfiguracion.rowCount === 0) {
            const ok = {
                ok: "No hay ninguna habitacion con ese identificador disponible para este apartamento"
            };
            salida.json(ok);
        }
        if (resuelveConsultaDetallesConfiguracion.rowCount > 0) {
            const consultaCamasEnHabitacion = await conexion.query(`SELECT cama FROM "configuracionCamasEnHabitacion" WHERE habitacion = $1`, [habitacionUID]);
            const camasArrayLimpioEnHabitacion = [];
            const camasEncontradasEnHabitacion = consultaCamasEnHabitacion.rows;
            for (const detalleHabitacion of camasEncontradasEnHabitacion) {
                const camaIDV = detalleHabitacion.cama;
                camasArrayLimpioEnHabitacion.push(camaIDV);
            }
            const resuelveCamasComoEntidad = await conexion.query(`SELECT cama, "camaUI" FROM camas`);
            const camasComoEntidad = resuelveCamasComoEntidad.rows;
            const camasComoEntidadArrayLimpio = [];
            const camasComoEntidadEstructuraFinal = {};
            for (const detalleHabitacion of camasComoEntidad) {
                const camaUI = detalleHabitacion.camaUI;
                const camaIDV = detalleHabitacion.cama;
                camasComoEntidadArrayLimpio.push(camaIDV);
                camasComoEntidadEstructuraFinal[camaIDV] = camaUI;
            }
            const camasDisponiblesNoInsertadas = camasComoEntidadArrayLimpio.filter(entidad => !camasArrayLimpioEnHabitacion.includes(entidad));
            const estructuraFinal = [];
            for (const camaDisponible of camasDisponiblesNoInsertadas) {
                if (camasComoEntidadEstructuraFinal[camaDisponible]) {
                    const estructuraFinalObjeto = {
                        camaIDV: camaDisponible,
                        camaUI: camasComoEntidadEstructuraFinal[camaDisponible]
                    };
                    estructuraFinal.push(estructuraFinalObjeto);
                }
            }
            const ok = {
                ok: estructuraFinal
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }

}