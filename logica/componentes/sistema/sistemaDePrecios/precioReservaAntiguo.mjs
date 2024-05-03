import { conexion } from '../../db.mjs';
// Este modulo ofrece los precios de un objeto de reserva
// MUY IMPORTANTE: El objeto reserva debe de estar validado con validarObjetoReserva()
const precioReserva = async (reserva) => {
    const alojamiento = reserva.alojamiento
    const fechaEntrada = reserva.entrada
    const fechaSalida = reserva.salida
    const fechaEntradaFinal = `${fechaEntrada.ano}/${fechaEntrada.mes}/${fechaEntrada.dia}`
    const fechaSalidaFinal = `${fechaSalida.ano}/${fechaSalida.mes}/${fechaSalida.dia}`
    const diferenciaEnMs = new Date(fechaSalidaFinal) - new Date(fechaEntradaFinal);
    const diferenciaEnDias = Math.floor(diferenciaEnMs / (1000 * 60 * 60 * 24));
    let desglosePreciosApartamentos = []
    let totalNeto = 0
    let precioFinal = {}
    precioFinal.numeroDeDiasConNoche = diferenciaEnDias
    for (const apartamento of Object.keys(alojamiento)) {
        const consultaPrecios = `
        SELECT precio, moneda 
        FROM "preciosApartamentos" 
        WHERE apartamento = $1;`
        let resuelveConsutaPrecios = await conexion.query(consultaPrecios, [apartamento])
        resuelveConsutaPrecios = resuelveConsutaPrecios.rows[0]
        totalNeto = totalNeto + Number(resuelveConsutaPrecios.precio)
        const obtenerApartamentoUI = `
        SELECT "apartamentoUI" 
        FROM apartamentos
        WHERE apartamento = $1;`
        let resuelveObtenerApartamentoUI = await conexion.query(obtenerApartamentoUI, [apartamento])
        const precioApartamento = {
            "apartamentoUI": resuelveObtenerApartamentoUI.rows[0].apartamentoUI,
            "apartamentoIDV": apartamento,
            "precioNetoDia": resuelveConsutaPrecios.precio,
            "moneda": resuelveConsutaPrecios.moneda
        }
        desglosePreciosApartamentos.push(precioApartamento)
    }
    precioFinal.precioNetoApartamentoDia = desglosePreciosApartamentos
    totalNeto = totalNeto.toFixed(2)
    precioFinal.totales = {}
    precioFinal.totales.totalNetoDia = totalNeto
    const cosultaImpuestosReserva = `
    SELECT impuesto, "tipoImpositivo", "tipoValor", moneda
    FROM impuestos 
    WHERE "aplicacionSobre" = $1 OR "aplicacionSobre" = $2;`
    let resuelveCosultaImpuestosReserva = await conexion.query(cosultaImpuestosReserva, ["totalReservaNeto", "totalNeto"])
    let impuestosReserva = resuelveCosultaImpuestosReserva.rows
    let objetoImpuestos = []
    let sumaImpuestos = 0
    for (const impuesto of impuestosReserva) {
        let impuestoNombre = impuesto["impuesto"]
        let tipoImpositivo = impuesto["tipoImpositivo"]
        let tipoValor = impuesto["tipoValor"]
        let moneda = impuesto["moneda"]
        let calculoImpuestoPorcentaje
        let presentacionImpuesto = {
            "tipoImpositivo": tipoImpositivo,
            "tipoValor": tipoValor,
        }
        if (tipoValor === "porcentaje") {
            calculoImpuestoPorcentaje = (totalNeto * impuesto.tipoImpositivo) / 100
            calculoImpuestoPorcentaje = calculoImpuestoPorcentaje.toFixed(2)
            presentacionImpuesto["calculoImpuestoPorcentaje"] = calculoImpuestoPorcentaje
            sumaImpuestos = sumaImpuestos + Number(calculoImpuestoPorcentaje)
        }
        if (tipoValor === "tasa") {
            sumaImpuestos = sumaImpuestos + Number(tipoImpositivo)
            presentacionImpuesto["moneda"] = moneda
        }
        //  
        let objetoImpuesto = {}
        objetoImpuesto[impuestoNombre] = presentacionImpuesto
        objetoImpuestos.push(objetoImpuesto)
    }
    precioFinal.totales.impuestos = objetoImpuestos
    const totalReservaNeto = totalNeto * diferenciaEnDias
    precioFinal.totales.totalReservaNeto = totalReservaNeto.toFixed(2);
    precioFinal.totales.totalImpuestos = sumaImpuestos.toFixed(2);
    const totalConImpuestos = totalReservaNeto + sumaImpuestos
    precioFinal.totales.totalConImpuestos = totalConImpuestos.toFixed(2);
    return precioFinal
}
export {
    precioReserva
}