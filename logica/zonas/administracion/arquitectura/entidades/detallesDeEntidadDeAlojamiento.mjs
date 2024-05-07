import { conexion } from "../../../../componentes/db.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";

export const detallesDeEntidadDeAlojamiento = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
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