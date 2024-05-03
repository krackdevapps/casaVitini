import { conexion } from "../../../componentes/db.mjs";
import { controlCaducidadEnlacesDePago } from "../../../sistema/controlCaducidadEnlacesDePago.mjs";


export const obtenerEnlaces = async (entrada, salida) => {
    try {
        await controlCaducidadEnlacesDePago();
        const consultaEnlaces = `
                            SELECT
                            "nombreEnlace", 
                            reserva,
                            codigo,
                            "enlaceUID",
                            caducidad,
                            cantidad,
                            "estadoPago",
                            descripcion
                            FROM "enlacesDePago"
                            ORDER BY 
                            "enlaceUID" DESC;`;
        const resuelveConsultaEnlaces = await conexion.query(consultaEnlaces);
        const ok = {
            ok: []
        };
        if (resuelveConsultaEnlaces.rowCount > 0) {
            const enlacesGenerados = resuelveConsultaEnlaces.rows;
            for (const detallesEnlace of enlacesGenerados) {
                const nombreEnlace = detallesEnlace.nombreEnlace;
                const enlaceUID = detallesEnlace.enlaceUID;
                const reservaUID = detallesEnlace.reserva;
                const codigo = detallesEnlace.codigo;
                const estadoPago = detallesEnlace.estadoPago;
                const cantidad = detallesEnlace.cantidad;
                const descripcion = detallesEnlace.descripcion;
                const totalIDV = "totalConImpuestos";
                const consultaPrecioCentralizado = `
                                    SELECT
                                    "totalConImpuestos"
                                    FROM "reservaTotales"
                                    WHERE 
                                        reserva = $1;`;
                const resuelveConsultaPrecioCentralizado = await conexion.query(consultaPrecioCentralizado, [reservaUID]);
                let precio;
                if (resuelveConsultaPrecioCentralizado.rowCount === 0) {
                    precio = "Reserva sin total";
                }
                if (resuelveConsultaPrecioCentralizado.rowCount === 1) {
                    precio = resuelveConsultaPrecioCentralizado.rows[0].totalConImpuestos;
                }
                const estructuraFinal = {
                    enlaceUID: enlaceUID,
                    nombreEnlace: nombreEnlace,
                    reservaUID: reservaUID,
                    estadoPago: estadoPago,
                    descripcion: descripcion,
                    enlace: codigo,
                    cantidad: cantidad,
                    totalReserva: precio,
                };
                ok.ok.push(estructuraFinal);
            }
        }
        salida.json(ok);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}