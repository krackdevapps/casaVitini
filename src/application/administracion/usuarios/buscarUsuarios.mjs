import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { buscarUsuariosPorTermino } from "../../../infraestructure/repository/usuarios/buscarUsuarios.mjs";
import { controlEstructuraPorJoi } from "../../../shared/validadores/controlEstructuraPorJoi.mjs";
import Joi from "joi";
import { obtenerUsuario } from "../../../infraestructure/repository/usuarios/obtenerUsuario.mjs";
import { rolesIDV } from "../../../shared/usuarios/rolesIDV.mjs";

export const buscarUsuarios = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const commonMessages = validadoresCompartidos.herramientasExternas.joi.mensajesErrorPersonalizados

        const esquemaBusqueda = Joi.object({
            buscar: Joi.string().required(),
            pagina: Joi.number(),
            tipoBusqueda: Joi.string(),
            nombreColumna: Joi.string(),
            sentidoColumna: Joi.string()
        }).required().messages(commonMessages)

        controlEstructuraPorJoi({
            schema: esquemaBusqueda,
            objeto: entrada.body
        })

        const buscar = validadoresCompartidos.tipos.cadena({
            string: entrada.body.buscar,
            nombreCampo: "El campo buscar esta vacío",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const nombreColumna = validadoresCompartidos.tipos.cadena({
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
            sentidoColumna = !sentidoColumna ? "ascendente" : sentidoColumna

            if (nombreColumna !== "rolIDV") {
                await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                    nombreColumna: nombreColumna,
                    tabla: "datosDeUsuario"
                })
            }

            validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)

        }
        const terminoBuscar = buscar.split(" ");
        const terminosFormateados = [];
        terminoBuscar.forEach((termino) => {
            const terminoFinal = "%" + termino + "%";
            terminosFormateados.push(terminoFinal);
        });
        const numeroPorPagina = 10;
        const numeroPagina = pagina

        const usuariosEncontrados = await buscarUsuariosPorTermino({
            terminosFormateados: terminosFormateados,
            numeroPorPagina: numeroPorPagina,
            numeroPagina: numeroPagina,
            nombreColumna: nombreColumna,
            sentidoColumna: sentidoColumna,
        })
        const consultaConteoTotalFilas = usuariosEncontrados[0]?.totalUsuarios ? usuariosEncontrados[0].totalUsuarios : 0;
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(numeroPagina).replace("0", "");
        const Respuesta = {
            ok: "Resultados de la busqueda",
            buscar: buscar,
            totalUsuarios: Number(consultaConteoTotalFilas),
            nombreColumna: nombreColumna,
            paginasTotales: totalPaginas,
            pagina: Number(corretorNumeroPagina),
        };
        if (nombreColumna) {
            Respuesta.nombreColumna;
            Respuesta.sentidoColumna = sentidoColumna;
        }
        usuariosEncontrados.forEach((detallesUsuario) => {
            delete detallesUsuario.totalUsuarios;
        });
        const resultadosFormateados = []

        const roles = rolesIDV({
            operacion: "enumerar"
        })
        for (const u of usuariosEncontrados) {
            const rolIDV = u.rolIDV
            delete u.rolIDV
            const rolUI = roles[rolIDV]
            const usuarioFormateado = {
                ...Object.fromEntries(Object.entries(u).slice(0, 1)),
                rolIDV: rolUI,
                ...Object.fromEntries(Object.entries(u).slice(1))
            };
            resultadosFormateados.push(usuarioFormateado);
        }

        Respuesta.usuarios = resultadosFormateados;
        return Respuesta
    } catch (errorCapturado) {
        throw errorCapturado
    }
}