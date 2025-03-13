import Joi from "joi";
import { obtenerServiciosConOrdenamiento } from "../../../infraestructure/repository/servicios/obtenerServiciosConOrdenamiento.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { controlEstructuraPorJoi } from "../../../shared/validadores/controlEstructuraPorJoi.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";

export const listaServiciosPaginados = async (entrada) => {
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
            await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                nombreColumna: nombreColumna,
                tabla: "servicios"
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
        const listaDeImpuesto = await obtenerServiciosConOrdenamiento(data)

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
        ok.ok = "Aqui tienes los servicios paginados"
        ok.totalServicios = Number(consultaConteoTotalFilas);
        ok.paginasTotales = totalPaginas;
        ok.pagina = pagina;
        ok.servicios = impuestosEncontradoas;
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}