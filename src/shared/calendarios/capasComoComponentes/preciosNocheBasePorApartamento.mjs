import { DateTime } from "luxon";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { obtenerReservasPorApartamentoIDVPorMesPorAno } from "../../../infraestructure/repository/reservas/selectoresDeReservas/obtenerReservasPorPlataformaIDV.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { procesador } from "../../contenedorFinanciero/procesador.mjs";
import { codigoZonaHoraria } from "../../configuracion/codigoZonaHoraria.mjs";
export const preciosNocheBasePorApartamento = async (metadatos) => {
    try {
        const fecha = metadatos.fecha
        const apartamentosIDV = metadatos.apartamentosIDV
        const filtroFecha = /^([1-9]|1[0-2])-(\d{1,})$/;
        if (!filtroFecha.test(fecha)) {
            const error = "La fecha no cumple el formato específico para el calendario. En este caso se espera una cadena con este formado MM-YYYY. Si el mes tiene un dígito, es un dígito, sin el cero delante."
            throw new Error(error)
        }

        const fechaArray = fecha.split("-")
        const mes = fechaArray[0]
        const ano = fechaArray[1]
        const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 });
        const numeroDeDiasDelMes = fechaObjeto.daysInMonth;

        const fechaObjetoFin = DateTime.fromObject({ year: ano, month: mes, day: numeroDeDiasDelMes });

        const calendarioObjeto = {}
        for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
            const diaISO = String(numeroDia).padStart(2, "0")
            const mesISO = String(mes).padStart(2, "0")

            const llaveCalendarioObjeto = `${ano}-${mesISO}-${diaISO}`
            calendarioObjeto[llaveCalendarioObjeto] = []
        }

        const zonaHoraria = await (codigoZonaHoraria).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual_ISO = tiempoZH.toISODate();

        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaObjeto.toISODate(),
                    fechaSalida: fechaObjetoFin.plus({ days: 1 }).toISODate(),
                    fechaActual: fechaActual_ISO,
                    apartamentosArray: apartamentosIDV,
                    origenSobreControl: "reserva",
                    obtenerComportamientosPorFechaCracionIgnorandoFechaActual: "si"
                },
                servicios: {
                    origen: "hubServicios",
                    serviciosSolicitados: []
                },
            },
            capas: {
                ofertas: {
                    zonasArray: ["global", "privada"],
                    operacion: {
                        tipo: "noAplicarOfertas"
                    },
                    ignorarCodigosDescuentos: "si"
                },
                impuestos: {
                    origen: "hubImuestos"
                }
            }
        })

        return desgloseFinanciero.entidades.reserva.desglosePorNoche

    } catch (errorCapturado) {
        throw errorCapturado
    }
}
