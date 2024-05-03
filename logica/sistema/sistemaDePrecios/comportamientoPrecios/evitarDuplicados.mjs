import { conexion } from "../../../componentes/db.mjs"
const evitarDuplicados = async (data) => {
    try {
        const comportamientoUID = data.comportamientoUID
        const tipo = data.tipo
        const transaccion = data.transaccion
        const apartamentos = data.apartamentos

        if (tipo === "porRango") {

            const fechaInicio_ISO = data.fechaInicio_ISO
            const fechaFinal_ISO = data.fechaFinal_ISO

            let resuelveVevalidarEspacioTemporalUnico
            if (transaccion === "crear") {
                const consulta = `
                    SELECT uid 
                    FROM "comportamientoPrecios" 
                    WHERE tipo = $1 AND "fechaInicio" <= $2::DATE AND "fechaFinal" >= $3::DATE;`
                resuelveVevalidarEspacioTemporalUnico = await conexion.query(consulta, [tipo, fechaFinal_ISO, fechaInicio_ISO])
            }
            if (transaccion === "actualizar") {
                const consulta = `
                   SELECT uid 
                   FROM "comportamientoPrecios" 
                   WHERE tipo = $1 AND "fechaInicio" <= $2::DATE AND "fechaFinal" >= $3::DATE AND uid <> $4;`
                resuelveVevalidarEspacioTemporalUnico = await conexion.query(consulta, [tipo, fechaFinal_ISO, fechaInicio_ISO, comportamientoUID])
            }

            if (resuelveVevalidarEspacioTemporalUnico.rowCount > 0) {
                const detallesApartamentosEntontradosPorValidas = []
                const comportamientoPreciosCocheTemporalPorAnalizar = resuelveVevalidarEspacioTemporalUnico.rows
                for (const apartmentosEnComportamiento of comportamientoPreciosCocheTemporalPorAnalizar) {
                    const UIDComportamientoChoque = apartmentosEnComportamiento.uid
                    const seleccionarApartamentosPorComportamiento = `
                         SELECT
                         cpa."apartamentoIDV", 
                         cpa.uid,
                         a."apartamentoUI",
                         cp."nombreComportamiento"
                         FROM
                         "comportamientoPreciosApartamentos" cpa
                         JOIN 
                         apartamentos a ON cpa."apartamentoIDV" = a.apartamento
                         JOIN 
                         "comportamientoPrecios" cp ON cpa."comportamientoUID" = cp.uid
                         WHERE "comportamientoUID" = $1;`
                    const resuelveSeleccionarApartamentosPorComportamiento = await conexion.query(seleccionarApartamentosPorComportamiento, [UIDComportamientoChoque])
                    if (resuelveSeleccionarApartamentosPorComportamiento.rowCount > 0) {
                        // Aqui falta un loop
                        const apartamentoExistentes = resuelveSeleccionarApartamentosPorComportamiento.rows
                        apartamentoExistentes.map((apartamentoExistente) => {
                            const apartamentoIDVEntonctrado = apartamentoExistente.apartamentoIDV
                            const apartamentoUIEncontrado = apartamentoExistente.apartamentoUI
                            const nombreComportamiento = apartamentoExistente.nombreComportamiento
                            const apartamentoCoincidenteDetalles = {
                                apartamentoIDV: apartamentoIDVEntonctrado,
                                apartamentoUI: apartamentoUIEncontrado,
                                nombreComportamiento: nombreComportamiento,
                            }
                            detallesApartamentosEntontradosPorValidas.push(apartamentoCoincidenteDetalles)
                        })
                    }
                }
                const coincidenciasExistentes = []
                for (const detalleApartemtno of apartamentos) {
                    const apartamentoIDVSolicitante = detalleApartemtno.apartamentoIDV
                    for (const detalleApartamentoYaExistente of detallesApartamentosEntontradosPorValidas) {
                        const apartamentoIDVExistente = detalleApartamentoYaExistente.apartamentoIDV
                        const nombreComportamiento = detalleApartamentoYaExistente.nombreComportamiento
                        const apartamentoUIExistente = detalleApartamentoYaExistente.apartamentoUI
                        if (apartamentoIDVSolicitante === apartamentoIDVExistente) {
                            const apartamentoImposibleDeGuardar = {
                                apartamentoIDV: apartamentoIDVExistente,
                                apartamentoUI: apartamentoUIExistente,
                                nombreComportamiento: nombreComportamiento,
                            }
                            coincidenciasExistentes.push(apartamentoImposibleDeGuardar)
                        }
                    }
                }
                const coincidenciaAgrupdasPorNombreComportamiento = {}
                coincidenciasExistentes.map((coincidencia) => {
                    const apartamentoUI = coincidencia.apartamentoUI
                    const nombreComportamiento = coincidencia.nombreComportamiento
                    if (coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento]) {
                        coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento].push(apartamentoUI)
                    } else {
                        coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento] = []
                        coincidenciaAgrupdasPorNombreComportamiento[nombreComportamiento].push(apartamentoUI)
                    }
                })
                const infoFinal = []
                for (const coincidenciaAgrupada of Object.entries(coincidenciaAgrupdasPorNombreComportamiento)) {
                    const nombreComportamiento = coincidenciaAgrupada[0]
                    const apartamentosCoincidentes = coincidenciaAgrupada[1].join(", ")
                    infoFinal.push(`${nombreComportamiento} (${apartamentosCoincidentes})`)
                }
                infoFinal.join(", ")
                if (coincidenciasExistentes.length > 0) {
                    const error = `No se puede crear este comportamiento de precio por que hay apartamentos en este comportamiento que existen en otros comportamientos cuyos rangos de fechas se pisan. Concretamente en: ${infoFinal}`
                    throw new Error(error)
                }
            }
        }
        if (tipo === "porDias") {
            const diasArray = data.diasArray
            let resuelveConsultaPorDias
            if (transaccion === "crear") {
                const consulta = `
                    SELECT *
                    FROM "comportamientoPrecios"
                    WHERE 
                    tipo = $1
                    AND
                    $2::text[] && "diasArray";
                    `
                resuelveConsultaPorDias = await conexion.query(consulta, [tipo, diasArray])
            }
            if (transaccion === "actualizar") {
                const consulta = `
                   SELECT *
                   FROM "comportamientoPrecios"
                   WHERE 
                   tipo = $1
                   AND
                   $2::text[] && "diasArray"
                   AND uid <> $3;
                   `
                resuelveConsultaPorDias = await conexion.query(consulta, [tipo, diasArray, comportamientoUID])
            }


            if (resuelveConsultaPorDias.rowCount > 0) {
                const comportamientosEncontrados_fase1 = resuelveConsultaPorDias.rows
                const comportamientosUIDParaComprobarApartamentos = []

                for (const detallescomportamientos of comportamientosEncontrados_fase1) {
                    const uid = detallescomportamientos.uid
                    comportamientosUIDParaComprobarApartamentos.push(uid)
                }

                const apartamentosIDV = []
                for (const detallesApartamento of apartamentos) {
                    apartamentosIDV.push(detallesApartamento.apartamentoIDV)
                }

                const consultaComportameintoConMismoApartamentos = `
                      SELECT *
                      FROM "comportamientoPreciosApartamentos"
                      WHERE 
                      "comportamientoUID" = ANY($1)
                      AND
                      "apartamentoIDV" = ANY($2)
                      ;`
                const confConsulta = [
                    comportamientosUIDParaComprobarApartamentos,
                    apartamentosIDV
                ]
                const resuelveConsultaPorApartamentos = await conexion.query(consultaComportameintoConMismoApartamentos, confConsulta)
                if (resuelveConsultaPorApartamentos.rowCount > 0) {
                    const comportamientosUID_conDuplicados = []

                    const comportamientosCoincidentes = resuelveConsultaPorApartamentos.rows
                    for (const detallesComportamiento of comportamientosCoincidentes) {
                        const uid_para_anadir = detallesComportamiento.comportamientoUID
                        comportamientosUID_conDuplicados.push(uid_para_anadir)
                    }

                    const comportamientosQueEntranEnConflicto = comportamientosEncontrados_fase1.filter(objeto => comportamientosUID_conDuplicados.includes(objeto.uid));
                    const arrayStringsPrePresentacionDatos = []
                    for (const detalles of comportamientosQueEntranEnConflicto) {
                        const uidComportamiento = detalles.uid
                        const nombreComportamiento = detalles.nombreComportamiento
                        const nombreUI = `${nombreComportamiento} (UID: ${uidComportamiento})`
                        arrayStringsPrePresentacionDatos.push(nombreUI)
                    }
                    const ultimoElemento = arrayStringsPrePresentacionDatos.pop();
                    const constructorCadenaFinalUI = arrayStringsPrePresentacionDatos.join(", ") + (arrayStringsPrePresentacionDatos.length > 0 ? " y " : "") + ultimoElemento;

                    const error = "El comportamiento de precio que intentas crear, coincide con otros comportamientos de precio, concretamente con: " + constructorCadenaFinalUI
                    throw new Error(error)
                }
            }
        }
    } catch (error) {
        throw error
    }
}
export {
    evitarDuplicados
};