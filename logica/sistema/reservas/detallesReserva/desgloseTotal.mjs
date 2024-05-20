import { conexion } from "../../componentes/db.mjs"

export const desgloseTotal = async (reservaUID) => {
    const desgloseFinanciero = {
        totalesPorNoche: [],
        totalesPorApartamento: [],
        ofertas: [],
        impuestos: [],
        totales: []
    }

    const seleccionarTotalesPorNoche = `
SELECT
to_char("fechaDiaConNoche", 'FMDD/FMMM/YYYY') as "fechaDiaConNoche", 
"precioNetoNoche",
"apartamentos"
FROM 
"reservaTotalesPorNoche" 
WHERE
reserva = $1`
    const resuelveSeleccionarTotalesPorNoche = await conexion.query(seleccionarTotalesPorNoche, [reservaUID])
    if (resuelveSeleccionarTotalesPorNoche.rowCount === 0) {
        const error = "Esta reserva no tiene informacion sobre los totales por noche"
        desgloseFinanciero.totalesPorNoche = []
    } else {
        desgloseFinanciero.totalesPorNoche = resuelveSeleccionarTotalesPorNoche.rows
    }
    const seleccionarTotalesPorApartamento = `
SELECT
"apartamentoIDV",
"apartamentoUI",
"totalNetoRango",
"precioMedioNocheRango"
FROM 
"reservaTotalesPorApartamento" 
WHERE
reserva = $1`
    const resuelveSeleccionarTotalesPorApartamento = await conexion.query(seleccionarTotalesPorApartamento, [reservaUID])
    if (resuelveSeleccionarTotalesPorApartamento.rowCount === 0) {
        const error = "Esta reserva no informacion sobre los totales por apartamento"
        desgloseFinanciero.totalesPorApartamento = []
    } else {
        desgloseFinanciero.totalesPorApartamento = resuelveSeleccionarTotalesPorApartamento.rows
    }
    const seleccionarOfertas = `
    SELECT
    "nombreOferta",
    "tipoOferta",
    definicion,
    descuento,
    "tipoDescuento",
    cantidad,
    "detallesOferta",
    "descuentoAplicadoA"
    FROM 
    "reservaOfertas" 
    WHERE
    reserva = $1;`
    const resuelveSeleccionarOfertas = await conexion.query(seleccionarOfertas, [reservaUID])
    if (resuelveSeleccionarOfertas.rowCount > 0) {
        const contenedorTipoOferta = {}
        for (const oferta of resuelveSeleccionarOfertas.rows) {
            const tipoOferta = oferta.tipoOferta
            if (!contenedorTipoOferta[tipoOferta]) {
                contenedorTipoOferta[tipoOferta] = []
            }
            if (tipoOferta === "porApartamentosEspecificos") {
                if (oferta.descuentoAplicadoA === "totalNetoApartamentoDedicado") {
                    delete oferta.tipoDescuento
                    delete oferta.cantidad
                }
                oferta.apartamentosEspecificos = oferta.detallesOferta
                delete oferta.detallesOferta
            }
            if (tipoOferta === "porRangoDeFechas") {
                oferta.diasAfectados = oferta.detallesOferta
                delete oferta.detallesOferta
            }
            contenedorTipoOferta[tipoOferta].push(oferta)
        }
        const contenedorFinalFormateado = []
        for (const contenedor of Object.entries(contenedorTipoOferta)) {
            const tipoOferta = contenedor[0]
            const contenedorOfertas = contenedor[1]
            const estructuraContenedor = {}
            estructuraContenedor[tipoOferta] = contenedorOfertas
            contenedorFinalFormateado.push(estructuraContenedor)
        }
        desgloseFinanciero.ofertas = contenedorFinalFormateado
    }
    const seleccionarImpuestos = `
SELECT
"nombreImpuesto",
"tipoImpositivo",
"tipoValor",
"calculoImpuestoPorcentaje"
FROM 
"reservaImpuestos" 
WHERE
reserva = $1`
    const resuelveSeleccionarImpuestos = await conexion.query(seleccionarImpuestos, [reservaUID])
    if (resuelveSeleccionarImpuestos.rowCount === 0) {
        const error = "Esta reserva no tiene informacion sobre los impuestos"
        desgloseFinanciero.impuestos = []
    } else {
        desgloseFinanciero.impuestos = resuelveSeleccionarImpuestos.rows
    }
    /*
    promedioNetoPorNoche
    totalReservaNetoSinOfertas
    totalReservaNeto
    totalDescuentosAplicados
    totalImpuestos
    totalConImpuestos
    */
    // Extraer datos de pago de la reserva
    const seleccionarTotales = `
    SELECT
    "promedioNetoPorNoche",
    "totalReservaNetoSinOfertas",
    "totalReservaNeto",
    "totalDescuentos",
    "totalImpuestos",
    "totalConImpuestos"
    FROM 
    "reservaTotales" 
    WHERE
    reserva = $1`
    const resuelveSeleccionarTotales = await conexion.query(seleccionarTotales, [reservaUID])
    if (resuelveSeleccionarTotales.rowCount === 0) {
        const error = "Esta reserva no disponible informacion sobre los totales"
        desgloseFinanciero.totales = []
    } else {
        desgloseFinanciero.totales = resuelveSeleccionarTotales.rows[0]
    }
    return reserva
};
