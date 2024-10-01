import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../configuracion/codigoZonaHoraria.mjs";
import { selector_hoy } from "../../../infraestructure/repository/reservas/buscador/perfiles/hoy.mjs";

export const hoy = async (data) => {
    try {

        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina

        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const tiempoZH = DateTime.now().setZone(zonaHoraria);
        const fechaActual_ISO = tiempoZH.toISODate();
        const dia = String(tiempoZH.day).padStart("2", "0");
        const mes = String(tiempoZH.month).padStart("2", "0");
        const ano = tiempoZH.year;
        //const numeroPagina = pagina - 1

        const reservas = await selector_hoy({
            numeroPorPagina: numeroPorPagina,
            numeroPagina: 0,
            fechaActual_ISO: fechaActual_ISO
        })
        const consultaConteoTotalFilas = reservas.length > 0
            ? reservas[0].total_filas
            : 0;
        for (const detallesFila of reservas) {
            delete detallesFila.total_filas;
        }
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const respuesta = {
            tipoConsulta: "rango",
            tipoCoincidencia: "porFechaDeEntrada",
            pagina: Number(1),
            fechaEntrada: fechaActual_ISO,
            paginasTotales: totalPaginas,
            totalReservas: Number(consultaConteoTotalFilas),
            nombreColumna: "fechaEntrada",
            sentidoColumna: "ascendente",
            reservas: reservas
        };
        return respuesta
    } catch (errorCapturado) {
        throw errorCapturado
    }
}