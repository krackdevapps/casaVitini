
export const administrationComponents = {
    componentes: {
        obtenerApartamentos: async () => {
            const transaccion = {
                zona: "administracion/componentes/apartamentosDisponiblesConfigurados"
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (respuestaServidor?.error) {
                casaVitini.ui.componentes.advertenciaInmersiva(respuestaServidor?.error)
            }
            if (respuestaServidor?.ok) {
                return respuestaServidor?.ok
            }
        },
        obtenerConfiguracionAlojamiento: async (apartamentoIDV) => {
            const transaccion = {
                zona: "administracion/arquitectura/configuraciones/detalleConfiguracionAlojamiento",
                apartamentoIDV
            }
            const respuestaServidor = await casaVitini.shell.servidor(transaccion)
            if (respuestaServidor?.error) {

            }
            if (respuestaServidor.ok) {
                return respuestaServidor
            }
        }
    }
}