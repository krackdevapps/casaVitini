import { porTerminos_ } from "../../../repositorio/reservas/buscador/perfiles/porTerminos_.mjs";

export const porTerminos = async (data) => {
    try {
        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina
        const sentidoColumna = data.sentidoColumna
        const nombreColumna = data.nombreColumna
        const termino = data.termino

        const arrayTerminmos = termino.toLowerCase().split(" ");
        const terminosFormateados = [];
        arrayTerminmos.map((terminoDelArray) => {
            const terminoFinal = "%" + terminoDelArray + "%";
            terminosFormateados.push(terminoFinal);
        });

        const reservas = await porTerminos_({
            numeroPorPagina: numeroPorPagina,
            numeroPagina: numeroPagina,
            sentidoColumna: sentidoColumna,
            nombreColumna: nombreColumna,
            termino: termino,
        })
        const consultaConteoTotalFilas = reservas[0]?.total_filas ? reservas[0].total_filas : 0;
        for (const detallesFila of reservas) {
            delete detallesFila.total_filas;
        }
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(numeroPagina).replace("0", "");

        const estructuraFinal = {
            tipoConsulta: "porTerminos",
            nombreColumna: nombreColumna,
            sentidoColumna: sentidoColumna,
            pagina: 1,
            totalReservas: Number(consultaConteoTotalFilas),
            paginasTotales: totalPaginas,
            pagina: Number(corretorNumeroPagina) + 1,
            termino: termino,
            reservas: reservas,
        }

        return estructuraFinal
    } catch (error) {
        throw error
    }
}