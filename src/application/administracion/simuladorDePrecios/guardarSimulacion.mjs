import { validadoresCompartidos } from "../../../shared/validadores/validadoresCompartidos.mjs";
import { eliminarBloqueoCaducado } from "../../../shared/bloqueos/eliminarBloqueoCaducado.mjs";
import { Mutex } from "async-mutex";
import { generadorReservaUID } from "../../../shared/reservas/utilidades/generadorReservaUID.mjs";
import { campoDeTransaccion } from "../../../infraestructure/repository/globales/campoDeTransaccion.mjs";
import { insertarSimulacionVacia } from "../../../infraestructure/repository/simulacionDePrecios/insertarSimulacionVacia.mjs";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";

export const guardarSimulacion = async (entrada) => {
    const mutex = new Mutex()
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

        const nombre = validadoresCompartidos.tipos.cadena({
            string: entrada.body.nombre,
            nombreCampo: "El campo del nombre de la simulación",
            filtro: "strictoConEspacios",
            sePermiteVacio: "no",
            limpiezaEspaciosAlrededor: "si",
        })

        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            validadoresCompartidos.tipos.cadena({
                string: testingVI,
                nombreCampo: "El campo testingVI",
                filtro: "strictoIDV",
                sePermiteVacio: "no",
                limpiezaEspaciosAlrededor: "si",
            })
        }
        await campoDeTransaccion("iniciar")
        mutex.acquire()
        await eliminarBloqueoCaducado();
        const reservaUID = await generadorReservaUID()
        const simulacion = await insertarSimulacionVacia({
            nombre,
            reservaUID,
            testingVI
        })
        await campoDeTransaccion("confirmar")

        const ok = {
            ok: "Se ha guardado la nueva simulación",
            simulacionUID: simulacion.simulacionUID
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