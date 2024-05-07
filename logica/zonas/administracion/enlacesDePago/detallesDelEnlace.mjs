import { conexion } from "../../../componentes/db.mjs";
import { utilidades } from "../../../componentes/utilidades.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/controlCaducidadEnlacesDePago.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const detallesDelEnlace = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        if (IDX.control()) return

        const enlaceUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.enlaceUID,
            nombreCampo: "El campo enlaceUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        await controlCaducidadEnlacesDePago();
        const consultaDetallesEnlace = `
                            SELECT
                            "nombreEnlace", 
                            codigo, 
                            reserva,
                            cantidad,
                            "estadoPago",
                            TO_CHAR(caducidad AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS caducidad
                            FROM "enlacesDePago"
                            WHERE "enlaceUID" = $1;`;
        const resuelveConsultaDetallesEnlace = await conexion.query(consultaDetallesEnlace, [enlaceUID]);
        if (resuelveConsultaDetallesEnlace.rowCount === 0) {
            const error = "noExisteElEnlace";
            throw new Error(error);
        }
        if (resuelveConsultaDetallesEnlace.rowCount === 1) {
            const detallesEnlace = resuelveConsultaDetallesEnlace.rows[0];
            const nombreEnlace = detallesEnlace.nombreEnlace;
            const codigo = detallesEnlace.codigo;
            const descripcion = detallesEnlace.descripcion;
            const reserva = detallesEnlace.reserva;
            const cantidad = detallesEnlace.cantidad;
            const caducidad = detallesEnlace.caducidad;
            const caducidadUTC = utilidades.convertirFechaUTCaHumano(caducidad);
            const caducidadMadrid = utilidades.deUTCaZonaHoraria(caducidad, "Europe/Madrid");
            const caducidadNicaragua = utilidades.deUTCaZonaHoraria(caducidad, "America/Managua");
            const consultaEstadoPago = `
                                SELECT
                                "estadoPago"
                                FROM reservas
                                WHERE reserva = $1;`;
            const resuelveConsultaEstadoPago = await conexion.query(consultaEstadoPago, [reserva]);
            const estadoPago = resuelveConsultaEstadoPago.rows[0].estadoPago;
            const ok = {
                ok: {
                    enlaceUID: enlaceUID,
                    nombreEnlace: nombreEnlace,
                    codigo: codigo,
                    reserva: reserva,
                    cantidad: cantidad,
                    estadoPago: estadoPago,
                    caducidadUTC: caducidadUTC,
                    caducidadMadrid: caducidadMadrid,
                    caducidadNicaragua: caducidadNicaragua
                }
            };
            salida.json(ok);
        }
    } catch (errorCapturado) {
        const error = {};
        if (errorCapturado.message === "noExisteElEnlace") {
            error.error = errorCapturado.message;
            error.noExisteElEnlace = "reservaSinEnlace";
        } else {
            error.error = errorCapturado.message;
        }
        salida.json(error);
    }
}