import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { obtenerSimulacionPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs";
import { obtenerApartamentoComoEntidadPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/entidades/apartamento/obtenerApartamentoComoEntidadPorApartamentoIDV.mjs";
import { obtenerServiciosPorSimulacionUID } from "../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServiciosPorSimulacionUID.mjs";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";
import { insertarApartamentoUIEnObjetoOfertas } from "../../../shared/ofertas/entidades/reserva/insertarApartamentoUIEnObjetoOfertas.mjs";
export const detallesSimulacion = async (entrada) => {
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 1
        })

        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El  simulacionUID",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)

        const nombre = simulacion.nombre
        const zonaIDV = simulacion.zonaIDV
        const fechaCreacion = simulacion.fechaCreacion
        const fechaEntrada = simulacion.fechaEntrada
        const fechaSalida = simulacion.fechaSalida
        const contenedorOfertas = simulacion.desgloseFinanciero.contenedorOfertas
        const contenedorOfertasPorAdmimnistrador = contenedorOfertas.ofertas.porAdministrador
        for (const contenedorOferta of contenedorOfertasPorAdmimnistrador) {
            await insertarApartamentoUIEnObjetoOfertas(contenedorOferta.oferta)
        }
        const contenedorOfertasPorCondicio = contenedorOfertas.ofertas.porCondicion
        for (const contenedorOferta of contenedorOfertasPorCondicio) {
            await insertarApartamentoUIEnObjetoOfertas(contenedorOferta.oferta)
        }
        const apartamentosIDVARRAY = simulacion.apartamentosIDVARRAY || []
        const apartamentos = []
        for (const apartamentoIDV of apartamentosIDVARRAY) {
            let apartamentoUI
            const configuracionAlojamiento = await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "desactivado"
            })
            if (configuracionAlojamiento?.apartamentoIDV) {
                apartamentoUI = (await obtenerApartamentoComoEntidadPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "desactivado"
                }))?.apartamentoUI
            } else {
                apartamentoUI = `IDV no reconocido (${apartamentoIDV})`
            }   
            apartamentos.push({
                apartamentoIDV,
                apartamentoUI
            })
        }

        await insertarApartamentoUIEnObjetoOfertas(contenedorOfertas)

        const serviciosDeLaSimulacion = await obtenerServiciosPorSimulacionUID(simulacionUID)

        const ok = {
            ok: "Aquí tienes los detalles de la simulación",
            nombre,
            zonaIDV,
            simulacionUID,
            fechaCreacion,
            fechaEntrada,
            fechaSalida,
            apartamentos,
            servicios: serviciosDeLaSimulacion,
            contenedorFinanciero: simulacion
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}