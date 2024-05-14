import { obtenerTodosImpuestosConOrdenamiento } from "../../../repositorio/impuestos/obtenerTodosImpuestosConOrdenamiento.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const listaImpuestos = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.control()

        const nombreColumna = validadoresCompartidos.tipos.cadena({
            string: configuracion.nombreColumna || "",
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        const sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: configuracion.sentidoColumna || "",
            nombreCampo: "El campo del sentido de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            soloMinusculas: "si"
        })

        const pagina = validadoresCompartidos.tipos.numero({
            number: entrada.body.pagina || 1,
            nombreCampo: "El numero de página",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        await validadoresCompartidos.baseDeDatos.validarNombreColumna(nombreColumna)
        validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)

        const numeroPorPagina = 10;
        const data = {
            nombreColumna: nombreColumna,
            sentidoColumna: sentidoColumna,
            numeroPagina: pagina,
            numeroPorPagina: numeroPorPagina,
        }
        const listaDeImpuesto = await obtenerTodosImpuestosConOrdenamiento(data)

        const consultaConteoTotalFilas = listaDeImpuesto.totalFilas
        const impuestosEncontradoas = listaDeImpuesto.resultados;
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        for (const detallesFila of impuestosEncontradoas) {
            delete detallesFila.total_filas;
        }
        const ok = {};
        if (nombreColumna) {
            ok.nombreColumna = nombreColumna;
            ok.sentidoColumna = sentidoColumna;
        }
        ok.totalImpuestos = Number(consultaConteoTotalFilas);
        ok.paginasTotales = totalPaginas;
        ok.pagina = pagina;
        ok.impuestos = impuestosEncontradoas;
        salida.json(ok);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}