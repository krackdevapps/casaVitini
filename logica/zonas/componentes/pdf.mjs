export const pdf = async (entrada, salida) => {
    try {
        const nombreEnlace = entrada.body.enlace;
        const filtroTextoSimple = /^[a-zA-Z0-9\s]+$/;
        if (!filtroTextoSimple.test(nombreEnlace)) {
            const error = "el campo 'nombreEnlace' solo puede ser una cadena de letras minúsculas y numeros sin espacios.";
            throw new Error(error);
        }
        await componentes.gestionEnlacesPDF.controlCaducidad();
        const consultaValidarEnlace = `
            SELECT
            "reservaUID"
            FROM 
            "enlacesPdf" 
            WHERE 
            enlace = $1
            `;
        const resuelveValidarEnlace = await conexion.query(consultaValidarEnlace, [nombreEnlace]);
        if (resuelveValidarEnlace.rowCount === 0) {
            const error = "No existe el enlace para generar el PDF";
            throw new Error(error);
        }
        const reservaUID = resuelveValidarEnlace.rows[0].reservaUID;
        const datosDetallesReserva = {
            reservaUID: reservaUID
        };
        const reserva = await detallesReserva(datosDetallesReserva);
        const pdf = await generadorPDF3(reserva);
        salida.setHeader('Content-Type', 'application/pdf');
        salida.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');
        salida.send(pdf);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}