import { DateTime } from "luxon";
import { obtenerComportamientosPorDiasTipoIDV } from "../../../infraestructure/repository/comportamientoDePrecios/obtenerComportamientosPorDiasPorTipoIDV.mjs";
export const comportamientosDePrecioBasadosEnDiaPorApartamento = async (metadatos) => {
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
        const fechaObjeto = DateTime.fromObject({ year: ano, month: mes, day: 1 }, { zone: 'utc' });
        const numeroDeDiasDelMes = fechaObjeto.daysInMonth;
        const calendarioObjeto = {}

        for (let numeroDia = 1; numeroDia <= numeroDeDiasDelMes; numeroDia++) {
            const diaISO = String(numeroDia).padStart(2, "0")
            const mesISO = String(mes).padStart(2, "0")
            const llaveCalendarioObjeto = `${ano}-${mesISO}-${diaISO}`
            calendarioObjeto[llaveCalendarioObjeto] = []
        }
        const ok = {
            eventosMes: calendarioObjeto,
            eventosEnDetalle: []
        }
        const comportamientosDePrecios = []
        const comportamientosDelApartamentoBasadosEnDias = await obtenerComportamientosPorDiasTipoIDV({
            nombreDiasAgrupados: ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"],
            arrayApartamentos: apartamentosIDV,
            tipoIDV: "porDias",
            estadoArray: ["activado"],
        })
        comportamientosDePrecios.push(...comportamientosDelApartamentoBasadosEnDias)


        const comportamientosUIDUnicos = new Set();
        const comportamientosDePreciosUnicos = comportamientosDelApartamentoBasadosEnDias.filter(o => {
            if (comportamientosUIDUnicos.has(o.comportamientoUID)) {

                return false; // Es un duplicado
            } else {
                comportamientosUIDUnicos.add(o.comportamientoUID);


                return true; // Es único
            }
        });
        for (const comportamiento of comportamientosDePreciosUnicos) {
            const comportamientoUID = comportamiento.comportamientoUID
            const nombreComportamiento = comportamiento.nombreComportamiento
            const contenedor = comportamiento.contenedor
            const apartamentoUID = comportamiento.componenteUID
            const fechaEntrada = contenedor.fechaInicio
            const fechaSalida = contenedor.fechaFinal
            const nombreDiasComportamiento = contenedor.dias
            //const comportamientoDelApartmento = contenedor.apartamentos.filter((c) => c.apartamentoIDV === apartamentoIDV)
            //const precioPorRano = comportamientoDelApartmento.precio
            const apartamentoIDVReserva = comportamiento.apartamentoIDV
            comportamiento.fechaEntrada = fechaEntrada
            comportamiento.fechaSalida = fechaSalida
            comportamiento.duracion_en_dias = 1
            comportamiento.tipoEvento = "comportamientosPorApartamentoBasadoEnDia"
            comportamiento.eventoUID = "comportamientoPorApartamentoBasadoEnDia_" + comportamientoUID
            // comportamiento.apartamentoUI = ((await obtenerApartamentoComoEntidadPorApartamentoIDV({
            //     apartamentoIDV: apartamentoIDV,
            //     errorSi: "noExiste"
            // }))).apartamentoUI

            comportamiento.contenedorFechasDelEvento = []
            Object.entries(calendarioObjeto).forEach(([fechaNoche, contenedor]) => {
                const nombreDia = DateTime.fromISO(fechaNoche, { locale: 'es' }).toFormat('cccc'); // 'cccc' devuelve el nombre completo del día

                if (nombreDiasComportamiento.includes(nombreDia)) {
                    const estructuraReservaEnDia = {
                        eventoUID: "comportamientoPorApartamentoBasadoEnDia_" + comportamientoUID,
                        fechaEntrada: fechaNoche,
                        fechaSalida: fechaNoche
                    }
                    contenedor.push(estructuraReservaEnDia)

                    comportamiento.contenedorFechasDelEvento.push({
                        fechaEntrada: fechaNoche,
                        fechaSalida: fechaNoche,
                        duracion_en_dias: 1
                    })
                }
            })
        }
        ok.eventosEnDetalle.push(...comportamientosDePreciosUnicos)

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}
