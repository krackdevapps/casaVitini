import { Mutex } from "async-mutex"
import { campoDeTransaccion } from "../../../../infraestructure/repository/globales/campoDeTransaccion.mjs"
import { VitiniIDX } from "../../../../shared/VitiniIDX/control.mjs"
import { procesador } from "../../../../shared/contenedorFinanciero/procesador.mjs"
import { validadoresCompartidos } from "../../../../shared/validadores/validadoresCompartidos.mjs"
import { obtenerConfiguracionPorApartamentoIDV } from "../../../../infraestructure/repository/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs"
import { obtenerSimulacionPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/obtenerSimulacionPorSimulacionUID.mjs"
import { validarDataGlobalDeSimulacion } from "../../../../shared/simuladorDePrecios/validarDataGlobalDeSimulacion.mjs"
import { obtenerServiciosPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/obtenerServiciosPorSimulacionUID.mjs"
import { insertarServicioPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/insertarServicioPorSimulacionUID.mjs"
import { obtenerServicioPorServicioUID } from "../../../../infraestructure/repository/servicios/obtenerServicioPorServicioUID.mjs"
import { eliminarServicioEnSimulacionPorServicioUID } from "../../../../infraestructure/repository/simulacionDePrecios/servicios/eliminarServicioEnSimulacionPorServicioUID.mjs"
import { actualizarDesgloseFinacieroDesdeHubsPorSimulacionUID } from "../../../../infraestructure/repository/simulacionDePrecios/desgloseFinanciero/actualizarDesgloseFinacieroDesdeHubsPorSimulacionUID.mjs"

export const reconstruirDesgloseDesdeHubs = async (entrada) => {
    const mutex = new Mutex()
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()
        validadoresCompartidos.filtros.numeroDeLLavesEsperadas({
            objeto: entrada.body,
            numeroDeLLavesMaximo: 3
        })
        const simulacionUID = validadoresCompartidos.tipos.cadena({
            string: entrada.body.simulacionUID,
            nombreCampo: "El identificador universal de la simulacionUID (simulacionUID)",
            filtro: "cadenaConNumerosEnteros",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })

        const sobreControl = validadoresCompartidos.tipos.cadena({
            string: entrada.body.sobreControl || "",
            nombreCampo: "El campo sobreControl",
            filtro: "strictoSinEspacios",
            sePermiteVacio: "si",
            limpiezaEspaciosAlrededor: "si",
            devuelveUnTipoNumber: "si"
        })
        if (sobreControl !== "" && sobreControl !== "activado") {
            const error = "El campo sobreControl si esta definido solo puede ser activado o un string vacío"
            throw new Error(error)
        }
        if (sobreControl === "") {
            const palabra = validadoresCompartidos.tipos.cadena({
                string: entrada.body.palabra,
                nombreCampo: "El campo de la palabra reconstruir",
                filtro: "strictoSinEspacios",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
                devuelveUnTipoNumber: "si"
            })
            if (palabra !== "reconstruir") {
                const error = "Por favor, escribe correctamente la palabra, reconstruir en el campo de texto. Escribe la palabra, reconstruir en minúsculas y sin espacios internos. Esto está así para evitar falsos clics."
                throw new Error(error)
            }
        }


        mutex.acquire()
        await campoDeTransaccion("iniciar")
        const simulacion = await obtenerSimulacionPorSimulacionUID(simulacionUID)
        await validarDataGlobalDeSimulacion(simulacionUID)
        const zonaIDV = simulacion.zonaIDV
        const fechaCreacion_simple = simulacion.fechaCreacion_simple
        const fechaEntrada = simulacion.fechaEntrada
        const fechaSalida = simulacion.fechaSalida
        const apartamentosArray = simulacion.apartamentosIDVARRAY
        try {
            for (const apartamentoIDV of apartamentosArray) {
                await obtenerConfiguracionPorApartamentoIDV({
                    apartamentoIDV,
                    errorSi: "noExiste"
                })
            }
        } catch (error) {
            const m = "No se puede reconstruir este desglose financiero de esta reserva desde los hubs de precios, porque hay apartamentos que ya no existen como configuración de alojamiento en el hub de configuraciones de alojamiento."
            throw new Error(m)
        }
        const serviciosInstantaneaSimulacion = await obtenerServiciosPorSimulacionUID(simulacionUID)

        for (const servicio of serviciosInstantaneaSimulacion) {
            const servicioUID_enSimulacion = servicio.servicioUID
            const servicioUID = servicio.contenedor.servicioUID
            await eliminarServicioEnSimulacionPorServicioUID(servicioUID_enSimulacion)

            const servicioDelHub = await obtenerServicioPorServicioUID(servicioUID)
            const nombreServicico = servicioDelHub.nombre
            const contenedorServicio = servicioDelHub.contenedor
            contenedorServicio.servicioUID = servicioDelHub.servicioUID
            await insertarServicioPorSimulacionUID({
                simulacionUID,
                nombre: nombreServicico,
                contenedor: contenedorServicio
            })
        }
        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    origen: "externo",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    fechaCreacion: fechaCreacion_simple,
                    apartamentosArray: apartamentosArray,
                    origenSobreControl: "simulacion"
                },
                servicios: {
                    origen: "instantaneaServiciosEnSimulacion",
                    simulacionUID: simulacionUID,
                },
            },
            capas: {
                ofertas: {
                    operacion: {
                        tipo: "insertarDescuentosPorCondicionPorCodigo"
                    },
                    zonasArray: [zonaIDV],
                    ignorarCodigosDescuentos: "no"
                },
                impuestos: {
                    origen: "hubImuestos",
                }
            }
        })

        await actualizarDesgloseFinacieroDesdeHubsPorSimulacionUID({
            desgloseFinanciero,
            simulacionUID
        })

        const instantaneaServiciosActualizada = await obtenerServiciosPorSimulacionUID(simulacionUID)
        await campoDeTransaccion("confirmar")
        const ok = {
            ok: "Se ha reconstruido el desglose desde las instantáneas",
            instantaneaServicios: instantaneaServiciosActualizada
        }
        return ok
    } catch (errorCapturado) {
        await campoDeTransaccion("cancelar")
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}