import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const detallesDeEntidadDeAlojamiento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const tipoEntidad = entrada.body.tipoEntidad;
        const entidadIDV = entrada.body.entidadIDV;
        const filtroCadenaMinusculasSinEspacios = /^[a-z0-9]+$/;
        const filtroCadenaMinusculasMayusculasSinEspacios = /^[a-zA-Z0-9]+$/;
        const filtroCadenaMinusculasConEspacios = /^[a-z0-9\s]+$/i;
        const filtroCadenaMinusculasMayusculasYEspacios = /^[a-zA-Z0-9\s]+$/;
        if (!tipoEntidad || !filtroCadenaMinusculasSinEspacios.test(tipoEntidad)) {
            const error = "el campo 'tipoEntidad' solo puede ser letras minúsculas y numeros. sin pesacios";
            throw new Error(error);
        }
        if (!entidadIDV || !filtroCadenaMinusculasSinEspacios.test(entidadIDV)) {
            const error = "el campo 'entidadIDV' solo puede ser letras minúsculas, numeros y sin espacios";
            throw new Error(error);
        }
        if (tipoEntidad === "apartamento") {
            const consultaDetalles = `
                                    SELECT 
                                    apartamento,
                                    "apartamentoUI"
                                    FROM apartamentos 
                                    WHERE apartamento = $1;`;
            const resuelveConsultaDetalles = await conexion.query(consultaDetalles, [entidadIDV]);
            if (resuelveConsultaDetalles.rowCount === 0) {
                const error = "No existe el apartamento";
                throw new Error(error);
            }
            if (resuelveConsultaDetalles.rowCount === 1) {
                const consultaCaracteristicas = `
                                        SELECT 
                                        caracteristica
                                        FROM "apartamentosCaracteristicas" 
                                        WHERE "apartamentoIDV" = $1;`;
                const resuelveCaracteristicas = await conexion.query(consultaCaracteristicas, [entidadIDV]);
                const ok = {
                    ok: resuelveConsultaDetalles.rows,
                    caracteristicas: resuelveCaracteristicas.rows
                };
                salida.json(ok);
            }
        }
        if (tipoEntidad === "habitacion") {
            const consultaDetalles = `
                                    SELECT 
                                    habitacion,
                                    "habitacionUI"
                                    FROM habitaciones 
                                    WHERE habitacion = $1;`;
            const resuelveConsultaDetalles = await conexion.query(consultaDetalles, [entidadIDV]);
            if (resuelveConsultaDetalles.rowCount === 0) {
                const error = "No existe la habitacion";
                throw new Error(error);
            }
            if (resuelveConsultaDetalles.rowCount === 1) {
                const ok = {
                    ok: resuelveConsultaDetalles.rows
                };
                salida.json(ok);
            }
        }
        if (tipoEntidad === "cama") {
            const consultaDetalles = `
                                    SELECT 
                                    cama,
                                    "camaUI",
                                    capacidad
                                    FROM camas
                                    WHERE cama = $1;`;
            const resuelveConsultaDetalles = await conexion.query(consultaDetalles, [entidadIDV]);
            if (resuelveConsultaDetalles.rowCount === 0) {
                const error = "No existe la cama";
                throw new Error(error);
            }
            if (resuelveConsultaDetalles.rowCount === 1) {
                const ok = {
                    ok: resuelveConsultaDetalles.rows
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