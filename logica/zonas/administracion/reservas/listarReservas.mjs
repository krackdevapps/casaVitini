import { hoy } from "../../../sistema/reservas/buscador/hoy.mjs";
import { porTerminos } from "../../../sistema/reservas/buscador/porTerminos.mjs";
import { rango } from "../../../sistema/reservas/buscador/rango.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../sistema/VitiniIDX/control.mjs";

export const listarReservas = async (entrada, salida) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        if (IDX.control()) return

        const pagina = validadoresCompartidos.tipos.numero({
            string: entrada.body.pagina || 1,
            nombreCampo: "El numero de página",
            filtro: "numeroSimple",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            sePermitenNegativos: "no"
        })
        const nombreColumna = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombreColumna,
            nombreCampo: "El campo del nombre de la columna",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
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
        validadoresCompartidos.filtros.sentidoColumna(sentidoColumna)

        const tipoConsulta = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoConsulta,
            nombreCampo: "El tipoConsulta",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const columnasVirtuales = [
            'nombreCompleto',
            'pasaporteTitular',
            'emailTitular'
        ];

        if (!columnasVirtuales.includes(nombreColumna)) {
            validadoresCompartidos.baseDeDatos.validarNombreColumna({
                nombreColumna: nombreColumna,
                tabla: "reservas"
            })
        }


        const numeroPagina = Number((pagina - 1) + "0");
        const numeroPorPagina = 10;
        const ok = {}
        if (tipoConsulta === "hoy") {
            const data = {
                numeroPorPagina: numeroPorPagina,
                numeroPagina: numeroPagina
            }
            const resultados = await hoy(data)
            Object.assign(ok, resultados)

        }
        else if (tipoConsulta === "rango") {

            const fechaEntrada = entrada.body.fechaEntrada;
            const fechaSalida = entrada.body.fechaSalida;
            const fechaEntrada_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaEntrada)).fecha_ISO
            const fechaSalida_ISO = (await validadoresCompartidos.fechas.validarFecha_Humana(fechaSalida)).fecha_ISO

            const tipoCoincidencia = validadoresCompartidos.tipos.cadena({
                string: entrada.body.tipoCoincidencia,
                nombreCampo: "El tipoCoincidencia",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })



            await validadoresCompartidos.fechas.validacionVectorial({
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                tipoVector: "diferente"
            })

            const data = {
                numeroPorPagina: numeroPorPagina,
                numeroPagina: numeroPagina,
                sentidoColumna: sentidoColumna,
                nombreColumna: nombreColumna,
                fechaEntrada_ISO: fechaEntrada_ISO,
                fechaSalida_ISO: fechaSalida_ISO,
                tipoCoincidencia: tipoCoincidencia,
            }

            const resultados = rango(data)
            Object.assign(ok, resultados)

        }
        else if (tipoConsulta === "porTerminos") {
            const termino = validadoresCompartidos.tipos.cadena({
                string: entrada.body.termino,
                nombreCampo: "El campo del termino",
                filtro: "strictoConEspacios",
                sePermiteVacio: "si",
                limpiezaEspaciosAlrededor: "si",
            })
            const data = {
                numeroPorPagina: numeroPorPagina,
                numeroPagina: numeroPagina,
                sentidoColumna: sentidoColumna,
                nombreColumna: nombreColumna,
                termino: termino,
            }

            const resultados = porTerminos(data)
            Object.assign(ok, resultados)
        }
        else {
            const error = "Hay que especificar el tipo de consulta, si es hoy, rango o porTerminos, revisa los parametros de tu busqueda";
            throw new Error(error);
        }
        salida.json(ok)
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        }
        salida.json(error);
    }
}