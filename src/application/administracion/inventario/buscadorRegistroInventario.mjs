import Joi from "joi";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { controlEstructuraPorJoi } from "../../../shared/validadores/controlEstructuraPorJoi.mjs";
import { obtenerResultadosBusquedaEnElRegistro } from "../../../infraestructure/repository/inventario/obtenerResultadosBusquedaEnElRegistro.mjs";

export const buscadorRegistroInventario = async (entrada, salida) => {
    try {

        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const esquemaBusqueda = Joi.object({
            buscar: Joi.string().messages(commonMessages).allow(''),
            pagina: Joi.number().messages(commonMessages),
            nombreColumna: Joi.string().messages(commonMessages),
            sentidoColumna: Joi.string().messages(commonMessages),
            tipoBusqueda: Joi.string().messages(commonMessages),
        }).required().messages(commonMessages)

        controlEstructuraPorJoi({
            schema: esquemaBusqueda,
            objeto: entrada.body
        })

        const buscar = validadoresCompartidos.tipos.cadena({
            string: entrada.body.buscar || "",
            nombreCampo: "El campo buscar esta vacío",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })

        const tipoBusqueda = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBusqueda || "",
            nombreCampo: "El tipoBusqueda",
            filtro: "strictoIDV",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
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
        })
        if (tipoBusqueda && tipoBusqueda !== "rapido") {
            const m = "Si se define tipoBusqueda, solo puede ser rápido o no definirse"
            throw new Error(m)
        }

        const pagina = validadoresCompartidos.tipos.numero({
            number: entrada.body.pagina || 1,
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

        const numeroPorPagina = 10;
        const resultadosBusqueda = await obtenerResultadosBusquedaEnElRegistro({
            numeroPagina: pagina,
            numeroPorPagina: numeroPorPagina,
            nombreColumna: nombreColumna,
            terminoBusqueda: buscar,
            sentidoColumna: sentidoColumna,
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