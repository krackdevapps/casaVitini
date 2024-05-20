import { porRango_cualquieraQueCoincida } from "../../../repositorio/reservas/buscador/perfiles/porRango_cualquieraQueCoincida.mjs";
import { porRango_porFechaDeEntrada } from "../../../repositorio/reservas/buscador/perfiles/porRango_porFechaDeEntrada.mjs";
import { porRango_porFechaDeSalida } from "../../../repositorio/reservas/buscador/perfiles/porRango_porFechaDeSalida.mjs";
import { porRango_soloDentroDelRango } from "../../../repositorio/reservas/buscador/perfiles/porRango_soloDentroDelRango.mjs";

export const rango = async (data) => {
    try {
        const fechaEntrada_ISO = data.fechaEntrada_ISO;
        const fechaSalida_ISO = data.fechaSalida_ISO;
        const tipoCoincidencia = data.tipoCoincidencia;
        const nombreColumna = data.nombreColumna;
        const sentidoColumna = data.sentidoColumna;
        const numeroPagina = data.numeroPagina;
        const numeroPorPagina = data.numeroPorPagina;

        if (tipoCoincidencia === "cualquieraQueCoincida") {

            const reservas = await porRango_cualquieraQueCoincida({
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                numeroPorPagina: numeroPorPagina,
                numeroPagina: numeroPagina,
                sentidoColumna: sentidoColumna,
                numeroPagina: numeroPagina
            })

            const consultaConteoTotalFilas = reservas?.total_filas
                ? reservas.total_filas
                : 0;
            for (const detallesFila of reservas) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(
                consultaConteoTotalFilas / numeroPorPagina
            );
            const corretorNumeroPagina = String(numeroPagina).replace("0", "");
            const ok = {
                tipoCoincidencia: "cualquieraQueCoincida",
                totalReservas: Number(consultaConteoTotalFilas),
                paginasTotales: totalPaginas,
                tipoConsulta: "rango",
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                pagina: Number(corretorNumeroPagina) + 1,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna,
                reservas: reservas,
            };
            return ok;
        } else if (tipoCoincidencia === "soloDentroDelRango") {
            const reservas = await porRango_soloDentroDelRango({
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                numeroPorPagina: numeroPorPagina,
                numeroPagina: numeroPagina,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna
            })
            const consultaConteoTotalFilas = reservas?.total_filas
                ? reservas.total_filas
                : 0;
            for (const detallesFila of reservas) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(
                consultaConteoTotalFilas / numeroPorPagina
            );
            const corretorNumeroPagina = String(numeroPagina).replace("0", "");
            const ok = {
                tipoCoincidencia: "soloDentroDelRango",
                totalReservas: Number(consultaConteoTotalFilas),
                paginasTotales: totalPaginas,
                tipoConsulta: "rango",
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                pagina: Number(corretorNumeroPagina) + 1,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna,
                reservas: reservas,
            };
            return ok
        } else if (tipoCoincidencia === "porFechaDeEntrada") {
            const reservas = await porRango_porFechaDeEntrada({
                fechaSalida_ISO: fechaSalida_ISO,
                numeroPorPagina: numeroPorPagina,
                numeroPagina: numeroPagina,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna
            })
            const consultaConteoTotalFilas = reservas?.total_filas
                ? reservas.total_filas
                : 0;
            for (const detallesFila of reservas) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(
                consultaConteoTotalFilas / numeroPorPagina
            );
            const corretorNumeroPagina = String(numeroPagina).replace("0", "");
            const ok = {
                tipoCoincidencia: "porFechaDeEntrada",
                totalReservas: Number(consultaConteoTotalFilas),
                paginasTotales: totalPaginas,
                tipoConsulta: "rango",
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                pagina: Number(corretorNumeroPagina) + 1,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna,
                reservas: reservas,
            };
            return ok
        } else if (tipoCoincidencia === "porFechaDeSalida") {

            const reservas = await porRango_porFechaDeSalida({
                fechaSalida_ISO: fechaSalida_ISO,
                numeroPorPagina: numeroPorPagina,
                numeroPagina: numeroPagina,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna
            })
            const consultaConteoTotalFilas = reservas?.total_filas
                ? reservas.total_filas
                : 0;
            for (const detallesFila of reservas) {
                delete detallesFila.total_filas;
            }
            const totalPaginas = Math.ceil(
                consultaConteoTotalFilas / numeroPorPagina
            );
            const corretorNumeroPagina = String(numeroPagina).replace("0", "");
            const ok = {
                tipoCoincidencia: "porFechaDeSalida",
                totalReservas: Number(consultaConteoTotalFilas),
                paginasTotales: totalPaginas,
                tipoConsulta: "rango",
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                pagina: Number(corretorNumeroPagina) + 1,
                nombreColumna: nombreColumna,
                sentidoColumna: sentidoColumna,
                reservas: reservas,
            };
            return ok
        } else {
            const error = "Falta especificar el tipo de coincidencia, por favor selecciona el tipo de coincidencia para poder realizar la busqueda";
            throw new Error(error);
        }
    } catch (error) {
        throw error;
    }
};
