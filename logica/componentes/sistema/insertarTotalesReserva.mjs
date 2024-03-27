import { conexion } from '../db.mjs';
import { validadoresCompartidos } from '../validadoresCompartidos.mjs';
import { actualizarEstadoPago } from './actualizarEstadoPago.mjs';
import { precioReserva } from './precioReserva.mjs';
const insertarTotalesReserva = async (metadatos) => {
    try {
        const tipoProcesadorPrecio = metadatos.tipoProcesadorPrecio
        const reserva = metadatos.reserva
        const reservaUID = metadatos.reservaUID
        if (tipoProcesadorPrecio !== "objeto" && tipoProcesadorPrecio !== "uid") {
            const error = "El tipo de procesador de precio solo puede ser objeto o uid"
            throw new Error(error)
        }
        const transaccion = {
            tipoProcesadorPrecio: tipoProcesadorPrecio
        }
        if (tipoProcesadorPrecio === "objeto") {
            transaccion.reserva = reserva
        }
        if (tipoProcesadorPrecio === "uid") {
            transaccion.reserva = reservaUID
            const detallesReserva = await validadoresCompartidos.reservas.validarReserva(reservaUID)
            const estadoReserva = detallesReserva.estadoReserva
            if (estadoReserva === "cancelada") {
                const error = "No se puede generar o volver a generar datos financieros de de una reserva cancelada"
                throw new Error(error)
            }
        }
        await conexion.query('BEGIN'); // Inicio de la transacción
        const resolverPrecio = await precioReserva(transaccion)
        const desgloseFinanciero = resolverPrecio.ok.desgloseFinanciero
        const totalesPorNoche = desgloseFinanciero.totalesPorNoche
        const detallePorApartamento = desgloseFinanciero.totalesPorApartamento
        const impuestos = desgloseFinanciero.impuestos
        const ofertas = desgloseFinanciero.ofertas
        const totales = desgloseFinanciero.totales
        const eliminaDetallePorDiaConNoche = `
        DELETE FROM "reservaTotalesPorNoche"
        WHERE reserva = $1;
        `
        await conexion.query(eliminaDetallePorDiaConNoche, [reservaUID])
        let reservaTotalesPorNocheUID
        for (const detallesDelDiaConNoche of totalesPorNoche) {
            const fechaDiaConNoche_Humana = detallesDelDiaConNoche.fechaDiaConNoche
            const fechaDiaConNoche_array = fechaDiaConNoche_Humana.split("/")
            const fechaDia = fechaDiaConNoche_array[0].padStart(2, "0")
            const fechaMes = fechaDiaConNoche_array[1].padStart(2, "0")
            const fechaAno = fechaDiaConNoche_array[2]
            const fechaDiaConNoche_ISO = `${fechaAno}-${fechaMes}-${fechaDia}`
            await validadoresCompartidos.fechas.validarFecha_ISO(fechaDiaConNoche_ISO)
            
            const precioNetoNoche = detallesDelDiaConNoche.precioNetoNoche
            const apartamentos = detallesDelDiaConNoche.apartamentos
            const insertarDetallePorDia = `
            INSERT INTO
            "reservaTotalesPorNoche"
            (
            reserva,
            "apartamentos",
            "precioNetoNoche",
            "fechaDiaConNoche"
            )
            VALUES ($1,$2::jsonb,$3,$4)
            RETURNING
            uid
            `
            const metadatosDetallePorDia = [
                reservaUID,
                JSON.stringify(apartamentos),
                precioNetoNoche,
                fechaDiaConNoche_ISO
            ]
            const resuelveInsertarDetallePorDia = await conexion.query(insertarDetallePorDia, metadatosDetallePorDia)
            if (resuelveInsertarDetallePorDia.rowCount === 0) {
                const error = "Ha ocurrido un error y no se ha podido anadir el desglose por dia en los datos de pago de la reserva"
                throw new Error(error)
            }
        }
        const eliminaDetallePorApartamento = `
        DELETE FROM "reservaTotalesPorApartamento"
        WHERE reserva = $1;
        `
        await conexion.query(eliminaDetallePorApartamento, [reservaUID])
        for (const detallesDelApartamentomo of detallePorApartamento) {
            const apartamentoIDV = detallesDelApartamentomo.apartamentoIDV
            const totalNetoRango = detallesDelApartamentomo.totalNetoRango
            const precioMedioNocheRango = detallesDelApartamentomo.precioMedioNocheRango
            const resolucionNombreApartamento = await conexion.query(`SELECT "apartamentoUI" FROM apartamentos WHERE apartamento = $1`, [apartamentoIDV])
            if (resolucionNombreApartamento.rowCount === 0) {
                const error = "No existe el identificador del apartamentoIDV 2"
                throw new Error(error)
            }
            const apartamentoUI = resolucionNombreApartamento.rows[0].apartamentoUI
            const insertarDetallePorApartamento = `
            INSERT INTO
            "reservaTotalesPorApartamento"
            (
            reserva,
            "apartamentoIDV",
            "apartamentoUI",
            "totalNetoRango",
            "precioMedioNocheRango"
            )
            VALUES ($1,$2,$3,$4,$5)
            `
            const metadatosDetallePorApartamento = [
                reservaUID,
                apartamentoIDV,
                apartamentoUI,
                totalNetoRango,
                precioMedioNocheRango,
            ]
            const resuelveInsertarDetallePorApartamento = await conexion.query(insertarDetallePorApartamento, metadatosDetallePorApartamento)
            if (resuelveInsertarDetallePorApartamento.rowCount === 0) {
                const error = "Ha ocurrido un error y no se ha podido anadir el deslose por apartamento en los datos de pago de la reserva"
                throw new Error(error)
            }
        }
        const eliminaImpuestos = `
        DELETE FROM "reservaImpuestos"
        WHERE reserva = $1;
        `
        await conexion.query(eliminaImpuestos, [reservaUID])
        for (const impuesto of impuestos) {
            const impuestoNombre = impuesto.nombreImpuesto
            const tipoImpositivo = impuesto.tipoImpositivo
            const tipoValor = impuesto.tipoValor
            const calculoImpuestoPorcentaje = impuesto.calculoImpuestoPorcentaje ? impuesto.calculoImpuestoPorcentaje : null
            const insertarImpuesto = `INSERT INTO
                "reservaImpuestos"
                (
                reserva,
                "nombreImpuesto",
                "tipoImpositivo",
                "tipoValor",
                "calculoImpuestoPorcentaje"
                )
                VALUES ($1,$2,$3,$4,$5)
                `
            const metadatosImpuestos = [
                reservaUID,
                impuestoNombre,
                tipoImpositivo,
                tipoValor,
                calculoImpuestoPorcentaje
            ]
            const resuelveInsertarImpuesto = await conexion.query(insertarImpuesto, metadatosImpuestos)
            if (resuelveInsertarImpuesto.rowCount === 0) {
                const error = "ha ocurrido un error y no se ha podido anadir los impuestos a la reserva"
                throw new Error(error)
            }
        }
        const eliminaOfertasAplicadas = `
        DELETE FROM "reservaOfertas"
        WHERE reserva = $1;
        `
        await conexion.query(eliminaOfertasAplicadas, [reservaUID])
        const insertarOferta = async (oferta) => {
            try {
                
                const nombreOferta = oferta.nombreOferta
                const tipoOferta = oferta.tipoOferta
                const detallesOferta = oferta.detallesOferta
                
                const tipoDescuento = oferta.tipoDescuento
                const cantidad = oferta.cantidad || null
                const descuentoAplicadoA = oferta.descuentoAplicadoA
                const definicion = oferta.definicion
                const descuento = oferta.descuento || null
                
                // Revisar esto con el tema de los detallesOferta
                const insertarOferta = `
                INSERT INTO "reservaOfertas"
                (
                  reserva,
                  "nombreOferta",
                  "tipoOferta",
                  "definicion",
                  descuento,
                  "detallesOferta",
                  "tipoDescuento",
                  cantidad,
                  "descuentoAplicadoA"
                )
                VALUES (
                  $1,
                  NULLIF($2, ''),
                  NULLIF($3, ''),
                  NULLIF($4, ''),
                 $5,
                  NULLIF(CAST($6 AS jsonb), '{}'::jsonb),
                  NULLIF($7, ''),
                 $8,
                  NULLIF($9, '')
                );`
                const metadatosOferta = [
                    reservaUID,
                    nombreOferta,
                    tipoOferta,
                    definicion,
                    descuento !== '' ? Number(descuento) : null,
                    JSON.stringify(detallesOferta),
                    tipoDescuento,
                    cantidad !== '' ? Number(cantidad) : null,
                    descuentoAplicadoA
                ]
                const resuelveInsertarOferta = await conexion.query(insertarOferta, metadatosOferta)
                if (resuelveInsertarOferta.rowCount === 0) {
                    const error = "Ha ocurrido un error y no se ha podido anadir la informacion de las ofertas a la reserva"
                    throw new Error(error)
                }
            } catch (error) {
                throw error
            }
        }
        
        for (const contenedorOfertas of ofertas) {
            const porNumeroDeApartamentos = contenedorOfertas.porNumeroDeApartamentos
            const porDiasDeReserva = contenedorOfertas.porDiasDeReserva
            const porDiasDeAntelacion = contenedorOfertas.porDiasDeAntelacion
            const porRangoDeFechas = contenedorOfertas.porRangoDeFechas
            const porApartamentosEspecificos = contenedorOfertas.porApartamentosEspecificos
            if (porNumeroDeApartamentos?.length) {
                for (const detallesOferta of porNumeroDeApartamentos) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        definicion: definicion,
                        descuento: descuento
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
            if (porDiasDeReserva?.length) {
                for (const detallesOferta of porDiasDeReserva) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const numero = detallesOferta.numero
                    const simboloNumero = detallesOferta.simboloNumero
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        numero: numero,
                        simboloNumero: simboloNumero,
                        definicion: definicion,
                        descuento: descuento
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
            if (porDiasDeAntelacion?.length) {
                for (const detallesOferta of porDiasDeAntelacion) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        definicion: definicion,
                        descuento: descuento
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
            if (porRangoDeFechas?.length) {
                for (const detallesOferta of porRangoDeFechas) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const diasAfectados = detallesOferta.diasAfectados
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        definicion: definicion,
                        descuento: descuento,
                        detallesOferta: diasAfectados
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
            if (porApartamentosEspecificos?.length) {
                for (const detallesOferta of porApartamentosEspecificos) {
                    const nombreOferta = detallesOferta.nombreOferta
                    const tipoDescuento = detallesOferta.tipoDescuento
                    const tipoOferta = detallesOferta.tipoOferta
                    const cantidad = detallesOferta.cantidad
                    const definicion = detallesOferta.definicion
                    const descuento = detallesOferta.descuento
                    const descuentoAplicadoA = detallesOferta.descuentoAplicadoA
                    const apartamentosEspecificos = detallesOferta.apartamentosEspecificos
                    const nuevaOferta = {
                        nombreOferta: nombreOferta,
                        tipoDescuento: tipoDescuento,
                        tipoOferta: tipoOferta,
                        cantidad: cantidad,
                        definicion: definicion,
                        descuento: descuento,
                        descuentoAplicadoA: descuentoAplicadoA,
                        detallesOferta: apartamentosEspecificos
                    }
                    await insertarOferta(nuevaOferta)
                }
            }
        }
        const eliminaTotales = `
        DELETE FROM "reservaTotales"
        WHERE reserva = $1;
        `
        await conexion.query(eliminaTotales, [reservaUID])
        const promedioNetoPorNoche = totales.promedioNetoPorNoche
        const totalReservaNetoSinOfertas = totales.totalReservaNetoSinOfertas
        const totalReservaNeto = totales.totalReservaNeto
        const totalDescuentos = totales.totalDescuentos
        const totalImpuestos = totales.totalImpuestos
        const totalConImpuestos = totales.totalConImpuestos
        //95 string string string string string
        typeof promedioNetoPorNoche,
            typeof totalReservaNetoSinOfertas,
            typeof totalReservaNeto,
            typeof totalDescuentos,
            typeof totalImpuestos,
            typeof totalConImpuestos
        //El error esta en que los totales mira como biene
        //10 object string string string string
        const consultaInsertarTotales = `
            INSERT INTO
            "reservaTotales"
            (
            "promedioNetoPorNoche",
            "totalReservaNetoSinOfertas",
            "totalReservaNeto",
            "totalDescuentos",
            "totalImpuestos",
            "totalConImpuestos",
            reserva
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            `
        const datosInsertarTotales = [
            promedioNetoPorNoche,
            totalReservaNetoSinOfertas,
            totalReservaNeto,
            totalDescuentos,
            totalImpuestos,
            totalConImpuestos,
            reservaUID
        ]
        const resuelveInsertartotalNetoPorDia = await conexion.query(consultaInsertarTotales, datosInsertarTotales)
        if (resuelveInsertartotalNetoPorDia.rowCount === 0) {
            const error = `Ha ocurrido un error y no se ha podido añadir los totales en la reserva`
            throw new Error(error)
        }
        await actualizarEstadoPago(reservaUID)
        await conexion.query('COMMIT'); // Confirmar la transacción
        const ok = {
            ok: "datos financieros generados correctamente en esta reserva"
        }
        return ok
    } catch (error) {
        await conexion.query('ROLLBACK'); // Revertir la transacción en caso de error
        throw error;
    }
}
export {
    insertarTotalesReserva
}