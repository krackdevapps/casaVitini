import { obtenerConfiguracionPorArrayDeApartamentoIDV } from "../../repositorio/arquitectura/obtenerConfiguracionPorArrayDeApartamentoIDV.mjs"
import { validadoresCompartidos } from "../validadores/validadoresCompartidos.mjs"

export const validarApartamentos = async (data) => {

    try {
        const apartamentos = data.apartamentos
        const contextoAplicacion = data.contextoAplicacion

        const parametrosConfiguracion = validadoresCompartidos.tipos.array({
            array: parametrosConfiguracion,
            nombreCampo: "El campo apartamentosSeleccionados",
        })

        for (const apartamentoSeleccionado of apartamentos) {
            const apartamentoIDV = validadoresCompartidos.tipos.cadena({
                string: apartamentoSeleccionado.apartamentoIDV,
                nombreCampo: "El campo apartamentoIDV",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const apartamentoUI = validadoresCompartidos.tipos.cadena({
                string: apartamentoSeleccionado.apartamentoUI,
                nombreCampo: "El campo apartamentoUI",
                filtro: "strictoConEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            const tipoDescuentoApartamento = validadoresCompartidos.tipos.cadena({
                string: apartamentoSeleccionado.tipoDescuento,
                nombreCampo: "El campo tipoDeceunto",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })

            if (contextoAplicacion === "totalNetoApartamentoDedicado") {

                if
                    (tipoDescuentoApartamento !== "cantidadFija" &&
                    tipoDescuentoApartamento !== "porcentaje" &&
                    tipoDescuentoApartamento !== "precioEstablecido") {
                    const error = `El apartamento ${apartamentoUI} debe de tener un tipo de descuente seleccionado, revisa los apartamentos para ver si en alguno falta un tipo de descuente`;
                    throw new Error(error);
                }
                const cantidadPorApartamento = validadoresCompartidos.tipos.cadena({
                    string: apartamentoSeleccionado.cantidad,
                    nombreCampo: "El campo cantidad del ${apartamentoUI} dedicado ",
                    filtro: "cadenaConNumerosConDosDecimales",
                    sePermiteVacio: "no",
                    limpiezaEspaciosAlrededor: "si",
                })
                if (tipoDescuentoApartamento === "porcentaje") {
                    validadoresCompartidos.filtros.limiteCienNumero(cantidadPorApartamento)
                }

            }
        }
        // No pueden existir dos apartamentos o mas iguales
        const apartamentosSeleccionadosPreProcesados = apartamentos.forEach((detallesApartamento) => {
            return detallesApartamento.apartamentoIDV
        });
        const apartamentosSeleccionadosUnicos = new Set(apartamentosSeleccionadosPreProcesados);
        const controlApartamentosIDV = apartamentosSeleccionadosPreProcesados.length !== apartamentosSeleccionadosUnicos.size;
        if (controlApartamentosIDV) {
            const error = "No se permiten apartamentos repetidos en el objeto de apartamentosSeleccionados";
            throw new Error(error);
        }

        // que los identificadores no existan.
        const apartamentosPorIDV = await obtenerConfiguracionPorArrayDeApartamentoIDV(apartamentosSeleccionadosPreProcesados)
        // Extraer los valores encontrados en la base de datos  
        const apartamentosIDVEncontrados = apartamentosPorIDV.forEach(apartamento => apartamento.apartamentoIDV);
        // Encontrar las cadenas que no coincidieron
        const cadenasNoCoincidentes = apartamentosSeleccionadosPreProcesados.filter((apartamentoIDV) => {
            !apartamentosIDVEncontrados.includes(apartamentoIDV)
        });
        if (cadenasNoCoincidentes.length > 0) {
            const error = `Se hace referencia a identificadores visuales de apartamentos que no existen. Por favor revisa los identificadores de los apartamentos a lo que quieres aplicar una oferta por que no existen`;
            throw new Error(error);
        }
    } catch (errorCapturado) {
        throw errorCapturado
    }
}