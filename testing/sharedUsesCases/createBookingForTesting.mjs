export const createBookingForTesting = async (data) => {
    try {

        const fechaInicio = data.fechaInicio
        const fechaFin = data.fechaFin
        const testingVI = data.testingVI

        const apartamentos = data.apartamentos

        const apartamentoIDV = "testingApartment"
        const apartamentoUI = "Apartamento para testing"
        const habitacionIDV = "habitacionparatesting"
        const camaIDV = "camatesting"
        let habitacionUID
        const fakeAdminSession = {
            usuario: "test",
            rolIDV: "administrador"
        }

        await eliminarApartamentoComoEntidad(apartamentoIDV)
        await eliminarCamaComoEntidad(camaIDV)
        await eliminarHabitacionComoEntidad(habitacionIDV)

        // Crear entidad apartamentos
        await crearEntidadAlojamiento({
            body: {
                tipoEntidad: "apartamento",
                apartamentoUI: apartamentoUI,
                apartamentoIDV: apartamentoIDV
            },
            session: fakeAdminSession
        })
        // Crear entidad habitacion
        await crearEntidadAlojamiento({
            body: {
                tipoEntidad: "habitacion",
                habitacionUI: "Habitacion para testing",
                habitacionIDV: habitacionIDV
            },
            session: fakeAdminSession
        })
        // Crear entidad cama
        await crearEntidadAlojamiento({
            body: {
                tipoEntidad: "cama",
                camaUI: "Nueva cama para testing",
                camaIDV: camaIDV,
                capacidad: "3",
                tipoCama: "compartida"
            },
            session: fakeAdminSession
        })
        // Crear configuracion de alojamiento
        await crearConfiguracionAlojamiento({
            body: {
                apartamentoIDV: apartamentoIDV,
                apartamentoUI: apartamentoUI
            },
            session: fakeAdminSession
        })
        // Actualizar zona de la configuracion de alojamiento
        const makeEntity = {
            body: {
                apartamentoIDV: apartamentoIDV,
                nuevaZona: "global"
            },
            session: fakeAdminSession
        }
        await actualizarZonaDeLaConfiguracionApartamento(makeEntity)
        // Añadir habitacion a la configuracion de alojamiento
        const habitacionAdded = await addHabitacionToConfiguracionApartamento({
            body: {
                habitacionIDV: habitacionIDV,
                apartamentoIDV: apartamentoIDV,
            },
            session: fakeAdminSession
        })
        habitacionUID = habitacionAdded.habitacionUID

        // Añadir cama a la habitacion
        await addCamaToConfiguracionApartamentoHabitacion({
            body: {
                camaIDV: camaIDV,
                habitacionUID: habitacionUID
            },
            session: fakeAdminSession
        })

        // Actualizar precio de la confioguracion de alojamiento
        await establecerNuevoPrecioApartamento({
            body: {
                apartamentoIDV: apartamentoIDV,
                nuevoPrecio: "100.00"
            },
            session: fakeAdminSession
        })
        // Actualizar el estado de la configuracion a disponible
        await cambiarEstadoConfiguracionAlojamiento({
            body: {
                apartamentoIDV: apartamentoIDV,
                nuevoEstado: "disponible"
            },
            session: fakeAdminSession
        })

        // Crear reserva


        await crearReservaSimpleAdministrativa({
            body: {
                fechaEntrada: fechaEntrada,
                fechaSalida: fechaSalida,
                apartamentos: [apartamentoIDV]
            },
            session: fakeAdminSession
        })

    } catch (error) {

    }
}