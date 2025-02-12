import { todo_ } from "../../../infraestructure/repository/reservas/buscador/perfiles/todo_.mjs";

export const todo = async (data) => {
    try {
        const numeroPorPagina = data.numeroPorPagina
        const numeroPagina = data.numeroPagina
        const sentidoColumna = data.sentidoColumna
        const nombreColumna = data.nombreColumna

  
        const reservas = await todo_({
            numeroPorPagina: numeroPorPagina,
            numeroPagina: numeroPagina,
            sentidoColumna: sentidoColumna,
            nombreColumna: nombreColumna,
        })


        const consultaConteoTotalFilas = reservas.length > 0
            ? reservas[0].total_filas
            : 0;
        for (const detallesFila of reservas) {
            delete detallesFila.total_filas;
        }
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(numeroPagina).replace("0", "");

        const estructuraFinal = {
            tipoConsulta: "todo",
            nombreColumna: nombreColumna,
            sentidoColumna: sentidoColumna,
            pagina: 1,
            totalReservas: Number(consultaConteoTotalFilas),
            paginasTotales: totalPaginas,
            pagina: Number(corretorNumeroPagina) + 1,
            reservas: reservas
        }

        return estructuraFinal
    } catch (errorCapturado) {
        throw errorCapturado
    }
}