import { DateTime } from "luxon";
import { codigoZonaHoraria } from "../../../sistema/configuracion/codigoZonaHoraria.mjs";
import { validadoresCompartidos } from "../../../sistema/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../sistema/bloqueos/eliminarBloqueoCaducado.mjs";
import { procesador } from "../../../sistema/contenedorFinanciero/procesador.mjs";
import { Mutex } from "async-mutex";
import { obtenerConfiguracionPorApartamentoIDV } from "../../../repositorio/arquitectura/configuraciones/obtenerConfiguracionPorApartamentoIDV.mjs";

export const generarSimulacion = async (entrada) => {
    const mutex = new Mutex()
    try {

        const fechaCreacion = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaCreacion,
            nombreCampo: "La fecha de fechaCreacion en generarSimulacion"
        }))

        const fechaEntrada = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaEntrada,
            nombreCampo: "La fecha de entrada en generarSimulacion"
        }))
        const fechaSalida = (await validadoresCompartidos.fechas.validarFecha_ISO({
            fecha_ISO: entrada.body.fechaSalida,
            nombreCampo: "La fecha de salida en generarSimulacion"
        }))
        const apartamentosIDVARRAY = validadoresCompartidos.tipos.array({
            array: entrada.body.apartamentosIDVARRAY,
            filtro: "strictoIDV",
            nombreCampo: "El campo apartamentosIDVARRAY"
        })
        await validadoresCompartidos.fechas.validacionVectorial({
            fechaEntrada: fechaEntrada,
            fechaSalida: fechaSalida,
            tipoVector: "diferente"
        })

        const controlIDVUnicos = {}
        for (const apartamentoIDV of apartamentosIDVARRAY) {
            if (controlIDVUnicos.hasOwnProperty(apartamentoIDV)) {
                const m = `El identificador visual ${apartamentoIDV} esta repetido.`
                throw new Error(m)
            }
            controlIDVUnicos[apartamentoIDV] = true

            await obtenerConfiguracionPorApartamentoIDV({
                apartamentoIDV,
                errorSi: "noExiste"
            })
        }

        mutex.acquire()
        const zonaHoraria = (await codigoZonaHoraria()).zonaHoraria;
        const fechaEntrada_objeto = DateTime.fromISO(fechaEntrada, { zone: zonaHoraria });
        const fechaCreacion_objeto = DateTime.fromISO(fechaCreacion, { zone: zonaHoraria });

        if (fechaEntrada_objeto < fechaCreacion_objeto) {
            const error = "La fecha de creacion simulada no puede ser superior a la fecha de entrada simulada.";
            throw new Error(error);
        }

        await eliminarBloqueoCaducado();
        const desgloseFinanciero = await procesador({
            entidades: {
                reserva: {
                    tipoOperacion: "crearDesglose",
                    fechaEntrada: fechaEntrada,
                    fechaSalida: fechaSalida,
                    fechaCreacion: fechaCreacion,
                    apartamentosArray: apartamentosIDVARRAY,
                    capaOfertas: "si",
                    zonasArray: ["global", "publica", "privada"],
                    descuentosParaRechazar: [],
                    capaDescuentosPersonalizados: "no",
                    descuentosArray: [],
                    capaImpuestos: "si",
                }
            },
        })

        const ok = {
            ok: "Aquí tíenes el desglose financiero en base a las fechas seleccionadas y los apartmentos seleccionados",
            desgloseFinanciero
        }

        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release()
        }
    }
}