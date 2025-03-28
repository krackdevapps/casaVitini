import Joi from "joi";
import { obtenerResultadosBusqueda } from "../../../infraestructure/repository/inventario/obtenerResultadosBusqueda.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";

import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { controlEstructuraPorJoi } from "../../../shared/validadores/controlEstructuraPorJoi.mjs";
import { obtenerResultadosBusquedaEnElRegistro } from "../../../infraestructure/repository/inventario/obtenerResultadosBusquedaEnElRegistro.mjs";
import { obtenerResultadosBusquedaEnElRegistroDelElemento } from "../../../infraestructure/repository/inventario/obtenerResultadosBusquedaEnElRegistroDelElemento.mjs";

export const buscadorRegistroDelElemento = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados


        const esquemaBusqueda = Joi.object({
            buscar: Joi.string().messages(commonMessages).allow(''),
            pagina: Joi.number().messages(commonMessages),
            nombreColumna: Joi.string().messages(commonMessages),
            sentidoColumna: Joi.string().messages(commonMessages),
            tipoBusqueda: Joi.string().messages(commonMessages),
            elementoUID: Joi.string().custom((value, helpers) => {
                try {
                    return validadoresCompartidos.tipos.cadena({
                        string: value,
                        nombreCampo: "El elementoUD",
                        filtro: "strictoIDV",
                        sePermiteVacio: "no",
                        limpiezaEspaciosAlrededor: "si",
                    })
                } catch (error) {
                    const path = helpers.state.path.join('.');
                    const mensajeError = `Error en ${path}: ${error.message}`;
                    return helpers.message(mensajeError);
                }
            }).required()
        }).required().messages(commonMessages)

      const oVal = controlEstructuraPorJoi({
            schema: esquemaBusqueda,
            objeto: entrada.body
        })

        const buscar = validadoresCompartidos.tipos.cadena({
            string: oVal.buscar || "",
            nombreCampo: "El campo buscar esta vacío",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const tipoBusqueda = validadoresCompartidos.tipos.cadena({
            string: oVal.tipoBusqueda || "",
            nombreCampo: "El tipoBusqueda",
            filtro: "strictoIDV",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        let nombreColumna = validadoresCompartidos.tipos.cadena({
            string: oVal.nombreColumna || "",
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        let sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: oVal.sentidoColumna || "",
            nombreCampo: "El campo del sentido de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        if (tipoBusqueda && tipoBusqueda !== "rapido") {
            const m = "Si se define tipoBusqueda, solo puede ser rápido o no definirse"
            throw new Error(m)
        }

        const pagina = validadoresCompartidos.tipos.numero({
            number: oVal.pagina || 1,
            nombreCampo: "El numero de página",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermiteCero: "no",
            sePermitenNegativos: "no"
        })

        if (nombreColumna) {
            if (nombreColumna === "registro_uid") {
                nombreColumna = "uid"
            }

            if (nombreColumna !== "nombre") {
                await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                    nombreColumna: nombreColumna,
                    tabla: "inventarioGeneralRegistro"
                })
            }
            sentidoColumna = sentidoColumna ? sentidoColumna : "ascendente"
            validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)
        }
        const elementoUID = oVal.elementoUID
        const numeroPorPagina = 10;
        const resultadosBusqueda = await obtenerResultadosBusquedaEnElRegistroDelElemento({
            numeroPagina: pagina,
            numeroPorPagina: numeroPorPagina,
            nombreColumna: nombreColumna,
            terminoBusqueda: buscar,
            sentidoColumna: sentidoColumna,
            elementoUID
        })

        const consultaConteoTotalFilas = resultadosBusqueda[0]?.totalElementos ? resultadosBusqueda[0].totalElementos : 0;
        resultadosBusqueda.forEach((elemento) => {
            delete elemento.totalElementos;
        });
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        //  const corretorNumeroPagina = String(pagina).replace("0", "");
        const respuesta = {
            ok: "Resultados de la busqueda",
            buscar: buscar,
            totalElementos: Number(consultaConteoTotalFilas),
            paginasTotales: totalPaginas,
            pagina: pagina,
        };
        if (nombreColumna) {
            if (nombreColumna === "elementoUID") {
                nombreColumna = "UID"
            }
            respuesta.nombreColumna = nombreColumna;
            respuesta.sentidoColumna = sentidoColumna;
        }
        respuesta.elementos = resultadosBusqueda;
        return respuesta
    } catch (errorCapturado) {
        throw errorCapturado
    }
}