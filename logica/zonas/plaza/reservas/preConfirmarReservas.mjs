export const preConfirmarReserva = async (entrada, salida) => {
    await mutex.acquire();
    try {
        if (!await interruptor("aceptarReservasPublicas")) {
            throw new Error(mensajesInterruptores.aceptarReservasPublicas);
        }
        const reserva = entrada.body.reserva;
        await conexion.query('BEGIN');
        const resuelveValidacionObjetoReserva = await validarObjetoReserva(reserva);
        if (!resuelveValidacionObjetoReserva.ok) {
            const error = "Ha ocurrido un error desconocido en la validacion del objeto";
            throw new Error(error);
        }
        await casaVitini.administracion.bloqueos.eliminarBloqueoCaducado();
        const resolvertInsertarReserva = await insertarReserva(reserva);
        const reservaUID = resolvertInsertarReserva.reservaUID;
        await actualizarEstadoPago(reservaUID);
        if (resolvertInsertarReserva.ok) {
            const metadatos = {
                reservaUID: reservaUID,
                solo: "globalYFinanciera"
            };
            const resolverDetallesReserva = await detallesReserva(metadatos);
            const enlacePDF = await componentes.gestionEnlacesPDF.crearEnlacePDF(reservaUID);
            resolverDetallesReserva.enlacePDF = enlacePDF;
            const ok = {
                ok: "Reserva confirmada y pagada",
                detalles: resolverDetallesReserva
            };
            salida.json(ok);
        }
        await conexion.query('COMMIT');
        enviarEmailReservaConfirmada(reservaUID);
    } catch (errorCapturado) {
        await conexion.query('ROLLBACK');
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    } finally {
        mutex.release();
    }
}