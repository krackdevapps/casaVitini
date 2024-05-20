import { obtenerComportamientosPorRangoPorTipoIDV } from '../../repositorio/comportamientoDePrecios/obtenerComportamientosPorRangoPorTipoIDV.mjs';
import { validadoresCompartidos } from '../validadores/validadoresCompartidos.mjs';

export const resolverComportamientosDePrecio = async (fechaEntrada_ISO, fechaSalida_ISO) => {
    await validadoresCompartidos.fechas.validarFecha_ISO(fechaEntrada_ISO);
    await validadoresCompartidos.fechas.validarFecha_ISO(fechaSalida_ISO);

    const estructuraComportamientos = [];
    const soloComportamientosActivados = "activado";
    const comportamientoDePrecios = await obtenerComportamientosPorRangoPorTipoIDV({
        fechaInicio_ISO: fechaEntrada_ISO,
        fechaFinal_ISO: fechaSalida_ISO,
        tipoIDV: soloComportamientosActivados,
    })
    if (comportamientoDePrecios.length > 0) {
        for (const detallesComportamiento of comportamientoDePrecios) {
            const uidComportamiento = detallesComportamiento.uid;
            const nombreComportamiento = detallesComportamiento.nombreComportamiento;
            const fechaInicioComportamiento = detallesComportamiento.fechaInicio;
            const fechaFinalComportamiento = detallesComportamiento.fechaFinal;
            const apartamentosDelComportamiento = await obtenerApartamentosDelComportamientoPorComportamientoUID(uidComportamiento)
            if (apartamentosDelComportamiento.length > 0) {
                for (const perfilComportamiento of apartamentosDelComportamiento) {
                    const simbolo = perfilComportamiento.simbolo;
                    const cantidad = perfilComportamiento.cantidad;
                    const apartamentoIDVComportamiento = perfilComportamiento.apartamentoIDV;
                    const constructorFaseUno = {
                        apartamentoIDV: apartamentoIDVComportamiento,
                        simbolo: simbolo,
                        nombreComportamiento: nombreComportamiento,
                        cantidad: cantidad,
                        fechaInicio: fechaInicioComportamiento,
                        fechaFinal: fechaFinalComportamiento,
                    };
                    estructuraComportamientos.push(constructorFaseUno);
                }
            }
        }
    }
    return estructuraComportamientos;
};
