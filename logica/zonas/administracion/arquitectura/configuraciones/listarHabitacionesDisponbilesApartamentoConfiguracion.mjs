import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const listarHabitacionesDisponbilesApartamentoConfiguracion = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return


        const apartamentoIDV = entrada.body.apartamentoIDV;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        if (!apartamentoIDV || !filtroCadenaMinusculasSinEspacios.test(apartamentoIDV)) {
            const error = "el campo 'apartamentoIDV' solo puede ser letras minúsculas, numeros y sin espacios";
            throw new Error(error);
        }
        const consultaDetallesConfiguracion = `
                                SELECT 
                                *
                                FROM "configuracionApartamento"
                                WHERE "apartamentoIDV" = $1;
                                `;
        const metadatos = [
            apartamentoIDV
        ];
        const resuelveConsultaDetallesConfiguracion = await conexion.query(consultaDetallesConfiguracion, metadatos);
        if (resuelveConsultaDetallesConfiguracion.rowCount === 0) {
            const error = "No hay ninguna configuracion disponible para este apartamento";
            throw new Error(error);
        }
        if (resuelveConsultaDetallesConfiguracion.rowCount > 0) {
            const consultaHabitacionesEnConfiguracion = await conexion.query(`SELECT habitacion FROM "configuracionHabitacionesDelApartamento" WHERE apartamento = $1`, [apartamentoIDV]);
            const habitacionesEnConfiguracionArrayLimpio = [];
            const habitacionesEnConfiguracion = consultaHabitacionesEnConfiguracion.rows;
            for (const detalleHabitacion of habitacionesEnConfiguracion) {
                const habitacionIDV = detalleHabitacion.habitacion;
                habitacionesEnConfiguracionArrayLimpio.push(habitacionIDV);
            }
            const resuelveHabitacionesComoEntidad = await conexion.query(`SELECT habitacion, "habitacionUI" FROM habitaciones`);
            const habitacionesComoEntidad = resuelveHabitacionesComoEntidad.rows;
            const habitacionComoEntidadArrayLimpio = [];
            const habitacionesComoEntidadEstructuraFinal = {};
            for (const detalleHabitacion of habitacionesComoEntidad) {
                const habitacionUI = detalleHabitacion.habitacionUI;
                const habitacionIDV = detalleHabitacion.habitacion;
                habitacionComoEntidadArrayLimpio.push(habitacionIDV);
                habitacionesComoEntidadEstructuraFinal[habitacionIDV] = habitacionUI;
            }
            const habitacionesDisponiblesNoInsertadas = habitacionComoEntidadArrayLimpio.filter(entidad => !habitacionesEnConfiguracionArrayLimpio.includes(entidad));
            const estructuraFinal = [];
            for (const habitacionDisponible of habitacionesDisponiblesNoInsertadas) {
                if (habitacionesComoEntidadEstructuraFinal[habitacionDisponible]) {
                    const estructuraFinalObjeto = {
                        habitacionIDV: habitacionDisponible,
                        habitacionUI: habitacionesComoEntidadEstructuraFinal[habitacionDisponible]
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