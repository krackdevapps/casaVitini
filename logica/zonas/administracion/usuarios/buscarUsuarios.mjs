import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { filtroError } from "../../../sistema/error/filtroError.mjs";
import { buscarUsuariosPorTermino } from "../../../repositorio/usuarios/buscarUsuarios.mjs";

export const buscarUsuarios = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

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
        const sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sentidoColumna,
            nombreCampo: "El campo del sentido de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
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
            await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                nombreColumna: nombreColumna,
                tabla: "datosDeUsuario"
            })
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
            buscar: buscar,
            totalUsuarios: consultaConteoTotalFilas,
            nombreColumna: nombreColumna,
            paginasTotales: totalPaginas,
            pagina: Number(corretorNumeroPagina) + 1,
        };
        if (nombreColumna) {
            Respuesta.nombreColumna;
            Respuesta.sentidoColumna = sentidoColumna;
        }
        usuariosEncontrados.forEach((detallesUsuario) => {
            delete detallesUsuario.totalUsuarios;
        });
        Respuesta.usuarios = usuariosEncontrados;
        salida.json(Respuesta);
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}