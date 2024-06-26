import { obtenerResultadosBusqueda } from "../../../repositorio/clientes/obtenerResultadosBusqueda.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";

export const buscar = async (entrada, salida) => {
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
        const tipoBusqueda = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoBusqueda,
            nombreCampo: "El tipoBusqueda",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const nombreColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreColumna,
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const sentidoColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sentidoColumna || "",
            nombreCampo: "El campo del sentido de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
        })
        if (tipoBusqueda !== "rapido") {
            tipoBusqueda = null;
        }

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
                tabla: "clientes"
            })
        }

        const numeroPorPagina = 10;
        const configuracionBusqueda = {
            numeroPagina: pagina,
            numeroPorPagina: numeroPorPagina,
            nombreColumna: nombreColumna,
            terminoBusqueda: buscar,
            sentidoColumna: sentidoColumna,
        }
        const resultadosBusqueda = await obtenerResultadosBusqueda(configuracionBusqueda)

        const consultaConteoTotalFilas = resultadosBusqueda[0]?.totalClientes ? resultadosBusqueda[0].totalClientes : 0;
        if (tipoBusqueda === "rapido") {
            resultadosBusqueda.forEach((cliente) => {
                delete cliente.Telefono;
                delete cliente.email;
                delete cliente.notas;
            });
        }
        resultadosBusqueda.forEach((cliente) => {
            delete cliente.totalClientes;
        });
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(pagina).replace("0", "");
        const respuesta = {
            buscar: buscar,
            totalClientes: consultaConteoTotalFilas,
            paginasTotales: totalPaginas,
            pagina: Number(corretorNumeroPagina) + 1,
        };
        if (nombreColumna) {
            respuesta.nombreColumna = nombreColumna;
            respuesta.sentidoColumna = nombreColumna;
        }
        respuesta.clientes = resultadosBusqueda;
        salida.json(respuesta);
    } catch (errorCapturado) {
        throw errorCapturado
    }
}