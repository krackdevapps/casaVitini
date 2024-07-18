
import { hoy } from "../../../../sistema/reservas/buscador/hoy.mjs";
import { porTerminos } from "../../../../sistema/reservas/buscador/porTerminos.mjs";
import { rango } from "../../../../sistema/reservas/buscador/rango.mjs";
import { validadorBusqueda } from "../../../../sistema/reservas/buscador/validarBusqueda.mjs";
import { validadoresCompartidos } from "../../../../sistema/validadores/validadoresCompartidos.mjs";
import { VitiniIDX } from "../../../../sistema/VitiniIDX/control.mjs";

export const listarReservas = async (entrada, salida) => {
    try {

        const session = entrada.session
        const IDX = new VitiniIDX(session, salida)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        const tipoConsulta = validadoresCompartidos.tipos.cadena({
            string: entrada.body.tipoConsulta,
            nombreCampo: "El tipoConsulta",
            filtro: "strictoIDV",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })
        const pagina = entrada.body.pagina
        let nombreColumna = entrada.body.nombreColumna
        let sentidoColumna = entrada.body.sentidoColumna

        if (nombreColumna === "reserva") {
            nombreColumna = "reservaUID"
        } else if (nombreColumna === "estadoPago") {
            nombreColumna = "estadoPagoIDV"
        } else if (nombreColumna === "estadoReserva") {
            nombreColumna = "estadoReservaIDV"
        }

        if (nombreColumna && !sentidoColumna) {
            sentidoColumna = "ascendente"
        }

        const configuracionValidador = {
            pagina: pagina,
            nombreColumna: nombreColumna,
            sentidoColumna: sentidoColumna
        }
        const numeroPorPagina = 10;
        const numeroPagina = Number((pagina - 1) + "0");

        const ok = {}
        if (tipoConsulta === "hoy") {
            const data = {
                numeroPorPagina: numeroPorPagina,
                numeroPagina: 1
            }
            const resultados = await hoy(data)
            Object.assign(ok, resultados)
        } else if (tipoConsulta === "rango") {
            validadorBusqueda(configuracionValidador)

            const tipoCoincidencia = validadoresCompartidos.tipos.cadena({
                string: entrada.body.tipoCoincidencia,
                nombreCampo: "El tipoCoincidencia",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
            const fechaEntrada = entrada.body.fechaEntrada
            const fechaSalida = entrada.body.fechaSalida

            if (
                tipoCoincidencia === "soloDentroDelRango" ||
                tipoCoincidencia === "cualquieraQueCoincida" ||
                tipoCoincidencia === "porFechaDeEntrada"
            ) {
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: entrada.body.fechaEntrada,
                    nombreCampo: "La fecha de entrada para listar reservas por rango"
                })
            }

            if (
                tipoCoincidencia === "soloDentroDelRango" ||
                tipoCoincidencia === "cualquieraQueCoincida" ||
                tipoCoincidencia === "porFechaDeSalida"
            ) {
                await validadoresCompartidos.fechas.validarFecha_ISO({
                    fecha_ISO: entrada.body.fechaSalida,
                    nombreCampo: "La fecha de salida para listar reservas por rango"
                })
            }

            if (fechaEntrada && fechaSalida) {
                await validadoresCompartidos.fechas.validacionVectorial({
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    tipoVector: "igual"
                })
            }


            const data = {
                numeroPorPagina: numeroPorPagina,
                numeroPagina: numeroPagina,
                sentidoColumna: sentidoColumna,
                nombreColumna: nombreColumna,
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                tipoCoincidencia: tipoCoincidencia,
            }
            const resultados = await rango(data)
            Object.assign(ok, resultados)

        } else if (tipoConsulta === "porTerminos") {
            validadorBusqueda(configuracionValidador)
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

            const resultados = await porTerminos(data)
            Object.assign(ok, resultados)
        }
        else {
            const error = "Hay que especificar el tipo de consulta, si es hoy, rango o porTerminos, revisa los parametros de tu busqueda";
            throw new Error(error);
        }


        if (ok.nombreColumna === "reservaUID") {
            ok.nombreColumna = "reserva"
        } else if (ok.nombreColumna === "estadoPagoIDV") {
            ok.nombreColumna = "estadoPago"
        } else if (ok.nombreColumna === "estadoReservaIDV") {
            ok.nombreColumna = "estadoReserva"
        }


        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}