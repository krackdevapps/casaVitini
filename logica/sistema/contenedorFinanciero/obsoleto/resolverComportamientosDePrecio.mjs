import { obtenerApartamentosDelComportamientoPorComportamientoUID } from '../../repositorio/comportamientoDePrecios/obtenerApartamentosDelComportamientoPorComportamientoUID.mjs';
import { obtenerComportamientosPorRangoPorTipoIDV } from '../../repositorio/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';

export const resolverComportamientosDePrecio = async (fechaEntrada, fechaSalida) => {
    await validadoresCompartidos.fechas.validarFecha_ISO({
        fecha_ISO: fechaEntrada,
        nombreCampo: "La fecha de entrado del comportamiento"
    });
    await validadoresCompartidos.fechas.validarFecha_ISO({
        fecha_ISO: fechaSalida,
        nombreCampo: "La fecah de salida del comportamiento"
    });

    const estructuraComportamientos = [];
    const soloComportamientosActivados = "activado";
    const comportamientoDePrecios = await obtenerComportamientosPorRangoPorTipoIDV({
        fechaInicio_ISO: fechaEntrada,
        fechaFinal_ISO: fechaSalida,
        tipoIDV: soloComportamientosActivados,
    })
    for (const detallesComportamiento of comportamientoDePrecios) {
        const comportamientoUID = detallesComportamiento.comportamientoUID;
        const nombreComportamiento = detallesComportamiento.nombreComportamiento;
        const fechaInicio = detallesComportamiento.fechaInicio;
        const fechaFinal = detallesComportamiento.fechaFinal;
        const apartamentosDelComportamiento = await obtenerApartamentosDelComportamientoPorComportamientoUID(comportamientoUID)
        if (apartamentosDelComportamiento.length > 0) {
            for (const perfilComportamiento of apartamentosDelComportamiento) {
                const simboloIDV = perfilComportamiento.simboloIDV;
                const cantidad = perfilComportamiento.cantidad;
                const apartamentoIDV = perfilComportamiento.apartamentoIDV;
                const diasArray = perfilComportamiento.diasArray
                const tipoIDV = perfilComportamiento.tipoIDV

                const constructorFaseUno = {
                    apartamentoIDV,
                    simboloIDV,
                    nombreComportamiento,
                    cantidad,
                    fechaInicio,
                    fechaFinal,
                    diasArray,
                    tipoIDV
                };
                estructuraComportamientos.push(constructorFaseUno);
            }
        }
    }

    return estructuraComportamientos;
};
