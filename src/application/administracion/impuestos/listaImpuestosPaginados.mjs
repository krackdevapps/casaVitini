import Joi from "joi";
import { obtenerTodosImpuestosConOrdenamiento } from "../../../infraestructure/repository/impuestos/obtenerTodosImpuestosConOrdenamiento.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { controlEstructuraPorJoi } from "../../../shared/validadores/controlEstructuraPorJoi.mjs";

import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

export const listaImpuestosPaginados = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const esquemaBusqueda = Joi.object({
            pagina: Joi.number(),
            nombreColumna: Joi.string(),
            sentidoColumna: Joi.string(),
            impuesto: Joi.string(),
        }).required()
        controlEstructuraPorJoi({
            schema: esquemaBusqueda,
            objeto: entrada.body
        })

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
            // if (nombreColumna === "tipoValor") {
            //     nombreColumna = "tipoValorIDV"
            // } else if (nombreColumna === "entidad") {
            //     nombreColumna = "entidadIDV"
            // } else if (nombreColumna === "estado") {
            //     nombreColumna = "estadoIDV"
            // }

            await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                nombreColumna: nombreColumna,
                tabla: "impuestos"
            })

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

        // if (nombreColumna === "tipoValorIDV") {
        //     nombreColumna = "tipoValor"
        // } else if (nombreColumna === "entidadIDV") {
        //     nombreColumna = "entidad"
        // } else if (nombreColumna === "estadoIDV") {
        //     nombreColumna = "estado"
        // }

        if (nombreColumna) {
            ok.nombreColumna = nombreColumna;
            ok.sentidoColumna = sentidoColumna;
        }
        ok.ok = "Aqui tienes los impuestos paginados"
        ok.totalImpuestos = Number(consultaConteoTotalFilas);
        ok.paginasTotales = totalPaginas;
        ok.pagina = pagina;
        ok.impuestos = impuestosEncontradoas;
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}