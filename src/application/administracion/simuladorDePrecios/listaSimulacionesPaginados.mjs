import Joi from "joi";
import { obtenerTodasSimulacionesConOrdenamiento } from "../../../infraestructure/repository/simulacionDePrecios/obtenerTodasSimulacionesConOrdenamiento.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { controlEstructuraPorJoi } from "../../../shared/validadores/controlEstructuraPorJoi.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

export const listaSimulacionesPaginados = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()


        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const esquemaBusqueda = Joi.object({
            pagina: Joi.number().messages(commonMessages),
            nombreColumna: Joi.string().messages(commonMessages),
            sentidoColumna: Joi.string().messages(commonMessages)
        }).required().messages(commonMessages)

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

        const pagina = validadoresCompartidos.tipos.granEntero({
            number: entrada.body.pagina || 1,
            nombreCampo: "El numero de página",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })

        if (nombreColumna) {
            if (nombreColumna === "uid") {
                nombreColumna = "simulacionUID"
            }
            await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                nombreColumna: nombreColumna,
                tabla: "simulacionesDePrecio"
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
        const listaDeSimulaciones = await obtenerTodasSimulacionesConOrdenamiento(data)

        const consultaConteoTotalFilas = listaDeSimulaciones.totalFilas
        const simulacionesEncontradoas = listaDeSimulaciones.resultados;
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        for (const detallesFila of simulacionesEncontradoas) {
            delete detallesFila.total_filas;
        }
        const ok = {};

        if (nombreColumna === "simulacionUID") {
            nombreColumna = "uid"
        }

        if (nombreColumna) {
            ok.nombreColumna = nombreColumna;
            ok.sentidoColumna = sentidoColumna;
        }
        ok.ok = "Simulacion paginadas"
        ok.totalSimulaciones = Number(consultaConteoTotalFilas);
        ok.paginasTotales = totalPaginas;
        ok.pagina = pagina;
        ok.simulaciones = simulacionesEncontradoas;
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}