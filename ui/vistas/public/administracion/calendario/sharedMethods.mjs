export const sharedMethodsCalendar = {
    obtenerCalendariosSincronizados: {
        airbnb: async function () {
            const transaccion = {
                zona: "administracion/calendario/obtenerNombresCalendarios/airbnb"
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                const estructuraFinal = []
                const calendariosSincronizados = respuestaServidor?.calendariosSincronizados
                if (calendariosSincronizados.length > 0) {
                    for (const detallesDelCalendario of calendariosSincronizados) {
                        const apartamentoIDV = detallesDelCalendario.apartamentoIDV
                        const apartamentoUI = detallesDelCalendario.apartamentoUI
                        const nombre = detallesDelCalendario.nombre
                        const calendarioUID = detallesDelCalendario.calendarioUID
                        const detallesApartamento = {
                            apartamentoIDV: apartamentoIDV,
                            apartamentoUI: apartamentoUI,
                            nombre: nombre,
                            calendarioUID: calendarioUID
                        }
                        estructuraFinal.push(detallesApartamento)
                    }
                }
                return estructuraFinal
            }
        }
    },

}