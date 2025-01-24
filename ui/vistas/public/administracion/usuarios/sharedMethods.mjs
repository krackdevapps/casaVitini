
export const sharedMethods = {
    configuracion: {
        obtenerConfiguracion: async function (data) {
            const paresConfIDV = data.paresConfIDV
            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/configuracion/configuracionUsuario/obtenerConfiguracion",
                paresConfIDV: paresConfIDV
            })
            if (respuestaServidor?.error) {
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                return respuestaServidor
            }
        },
        actualizarConfiguracion: async function (data) {

            const configuracionIDV = data.configuracionIDV
            const valor = data.valor

            const respuestaServidor = await casaVitini.shell.servidor({
                zona: "administracion/configuracion/configuracionUsuario/actualizarConfiguracion",
                configuracionIDV,
                valor
            })
            if (respuestaServidor?.error) {
                return casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                return respuestaServidor
            }
        }
    }
}