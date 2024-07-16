import { obtenerTodosImpuestosConOrdenamiento } from "../../../repositorio/impuestos/obtenerTodosImpuestosConOrdenamiento.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const listaImpuestosPaginados = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.control()

        let nombreColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreColumna || "",
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        let sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sentidoColumna || "",
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

        if (nombreColumna) {


            if (nombreColumna === "tipoValor") {
                nombreColumna = "tipoValorIDV"
            } else if (nombreColumna === "entidad") {
                nombreColumna = "entidadIDV"
            } else if (nombreColumna === "estado") {
                nombreColumna = "estadoIDV"
            }

            await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                nombreColumna: nombreColumna,
                tabla: "impuestos"
            })
            console.log("sentidoColumna", sentidoColumna)
            if (!sentidoColumna) {
                sentidoColumna = "ascendente"
            }
            validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)

        }

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

        if (nombreColumna === "tipoValorIDV") {
            nombreColumna = "tipoValor"
        } else if (nombreColumna === "entidadIDV") {
            nombreColumna = "entidad"
        } else if (nombreColumna === "estadoIDV") {
            nombreColumna = "estado"
        }

        if (nombreColumna) {
            ok.nombreColumna = nombreColumna;
            ok.sentidoColumna = sentidoColumna;
        }
        ok.totalImpuestos = Number(consultaConteoTotalFilas);
        ok.paginasTotales = totalPaginas;
        ok.pagina = pagina;
        ok.impuestos = impuestosEncontradoas;
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}