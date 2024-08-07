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
            string: entrada.body.buscar || "",
            nombreCampo: "El campo buscar esta vacío",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
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
            const m = "Si se defdine tipoBusqueda, solo puede ser rapido o no definnirse"
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
            if (nombreColumna === "uid") {
                nombreColumna = "clienteUID"
            }
            await validadoresCompartidos.baseDeDatos.validarNombreColumna({
                nombreColumna: nombreColumna,
                tabla: "clientes"
            })
            sentidoColumna = sentidoColumna ? sentidoColumna : "ascendente"
            validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)
        }

        const numeroPorPagina = 10;
        const resultadosBusqueda = await obtenerResultadosBusqueda({
            numeroPagina: pagina,
            numeroPorPagina: numeroPorPagina,
            nombreColumna: nombreColumna,
            terminoBusqueda: buscar,
            sentidoColumna: sentidoColumna,
        })

        const consultaConteoTotalFilas = resultadosBusqueda[0]?.totalClientes ? resultadosBusqueda[0].totalClientes : 0;
        if (tipoBusqueda === "rapido") {
            resultadosBusqueda.forEach((cliente) => {
                delete cliente.Teléfono;
                delete cliente.mail;
                delete cliente.notas;
            });
        }
        resultadosBusqueda.forEach((cliente) => {
            delete cliente.totalClientes;
            delete cliente.notas;

        });
        const totalPaginas = Math.ceil(consultaConteoTotalFilas / numeroPorPagina);
        const corretorNumeroPagina = String(pagina).replace("0", "");
        const respuesta = {
            buscar: buscar,
            totalClientes: Number(consultaConteoTotalFilas),
            paginasTotales: totalPaginas,
            pagina: pagina,
        };
        if (nombreColumna) {
            if (nombreColumna === "clienteUID") {
                nombreColumna = "uid"
            }
            respuesta.nombreColumna = nombreColumna;
            respuesta.sentidoColumna = sentidoColumna;
        }
        respuesta.clientes = resultadosBusqueda;
        salida.json(respuesta);
    } catch (errorCapturado) {
        throw errorCapturado
    }
}