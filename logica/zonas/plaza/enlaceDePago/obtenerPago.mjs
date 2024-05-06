export const obtenerPago = async (entrada, salida) => {
    try {
        const pagoUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.pagoUID,
            nombreCampo: "El identificador universal del pago (pagoUID)",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const filtroCadena = /^[a-z0-9]+$/;
        if (!pagoUID || !filtroCadena.test(pagoUID)) {
            const error = "el codigo de un enlace de pago solo puede ser una cadena de minuscuals y numeros y ya esta";
            throw new Error(error);
        }
        const consultaDetallesEnlace = `
            SELECT
            "nombreEnlace", 
            codigo, 
            reserva,
            cantidad,
            descripcion,
            caducidad,
            "estadoPago"
            FROM "enlacesDePago"
            WHERE codigo = $1;`;
        const resuelveConsultaDetallesEnlace = await conexion.query(consultaDetallesEnlace, [pagoUID]);
        if (resuelveConsultaDetallesEnlace.rowCount === 0) {
            const error = "No existe ningún pago con este identificador de pago, por favro revisa que el identificador de pago sea correcto y no halla caducado";
            throw new Error(error);
        }
        if (resuelveConsultaDetallesEnlace.rowCount === 1) {
            const detallesEnlace = resuelveConsultaDetallesEnlace.rows[0];
            const estadoPago = detallesEnlace.estadoPago;
            if (estadoPago === "pagado") {
                const error = "Este enlace de pago esta pagado";
                throw new Error(error);
            }
            const codigo = detallesEnlace.codigo;
            const reserva = detallesEnlace.reserva;
            const cantidadPagoParcial = detallesEnlace.cantidad;
            const consultaEstadoPago = `
                SELECT
                "estadoPago",
                "estadoReserva"
                FROM reservas
                WHERE reserva = $1;`;
            const resuelveConsultaEstadoPago = await conexion.query(consultaEstadoPago, [reserva]);
            const estadoReserva = resuelveConsultaEstadoPago.rows[0].estadoReserva;
            if (estadoReserva === "cancelada") {
                const error = "La reserva esta cancelada";
                throw new Error(error);
            }
            // Hay que cambiar esto para hacer un pago en base a la cantidad especifica del enlace de pago y no del total de la reserva
            /*
            promedioNetoPorNoche
            totalReservaNetoSinOfertas
            totalReservaNeto
            totalDescuentosAplicados
            totalImpuestos
            totalConImpuestos
            */
            const consultaTotalesReserva = `
                SELECT
                "promedioNetoPorNoche",
                "totalReservaNetoSinOfertas",
                "totalReservaNeto",
                "totalDescuentos",
                "totalImpuestos",
                "totalConImpuestos"
                FROM "reservaTotales"
                WHERE reserva = $1;`;
            const resuelveConsultaTotalesReserva = await conexion.query(consultaTotalesReserva, [reserva]);
            if (resuelveConsultaTotalesReserva.rowCount === 0) {
                const error = "Esta reserva no tiene totales";
                throw new Error(error);
            }
            const estructuraTotales = resuelveConsultaTotalesReserva.rows[0];
            const sumaImpuestos = new Decimal(estructuraTotales.totalImpuestos);
            const totalNeto = new Decimal(estructuraTotales.totalReservaNeto);
            const proporcion = new Decimal(cantidadPagoParcial).times(100).dividedBy(totalNeto).times(sumaImpuestos.dividedBy(100));
            const calcularProporcionNetoImpuestosPagoParcial = (precioNetoReserva, impuestosReserva, cantidadPago) => {
                // Convierte los valores a objetos Decimal para mayor precisión
                const precioNetoDecimal = new Decimal(precioNetoReserva);
                const impuestosDecimal = new Decimal(impuestosReserva);
                const cantidadPagoDecimal = new Decimal(cantidadPago);
                // Calcula el precio bruto sumando el precio neto y los impuestos
                const precioBruto = precioNetoDecimal.plus(impuestosDecimal);
                // Calcula la proporción que representa la cantidad del pago con respecto al precio bruto
                const proporcionPago = cantidadPagoDecimal.div(precioBruto);
                // Calcula el precio neto correspondiente a la cantidad del pago
                const precioNetoPago = precioNetoDecimal.times(proporcionPago);
                // Calcula los impuestos correspondientes a la cantidad del pago
                const impuestosPago = impuestosDecimal.times(proporcionPago);
                // Devuelve los resultados como objetos Decimal
                // Redondea los resultados a dos decimales
                const precioNetoRedondeado = precioNetoPago.toDecimalPlaces(2);
                const impuestosRedondeados = impuestosPago.toDecimalPlaces(2);
                // Devuelve los resultados redondeados como strings
                return {
                    precioNetoPago: precioNetoRedondeado.toString(),
                    impuestosPago: impuestosRedondeados.toString(),
                };
            };
            // Ejemplo de uso
            const precioNetoReserva = 122;
            const impuestosReserva = 18; // Por ejemplo
            const cantidadPago = 50;
            const resultadoCalculado = calcularProporcionNetoImpuestosPagoParcial(estructuraTotales.totalReservaNeto, estructuraTotales.totalImpuestos, cantidadPagoParcial);
            const estructuraEnlace = {
                codigo: codigo,
                reserva: reserva,
                totales: estructuraTotales,
                pagoParcial: {
                    netoParcial: resultadoCalculado.precioNetoPago,
                    impuestosParciales: resultadoCalculado.impuestosPago,
                    cantidadParcial: cantidadPagoParcial,
                }
            };
            const ok = {
                ok: estructuraEnlace
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