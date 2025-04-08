
import { DateTime } from "luxon";
import { insertarDeposito } from "../../../../infraestructure/repository/finanzas/depositos/insertarDeposito.mjs";
import { finanzasValidadorCompartido } from "../../../../shared/finanzas/finanzasValidadorCompartido.mjs";

export const crearNuevoDeposito = async (entrada, salida) => {
    try {


        const elementoValidado = finanzasValidadorCompartido({
            o: entrada.body,
            filtrosIDV: [
                "nombre",
                "plataforma",
            ]
        })

        const tiempoZH = DateTime.now()
        const fechaActual = tiempoZH.toISO();

        const deposito = await insertarDeposito({
            nombre: elementoValidado.nombre,
            plataforma: elementoValidado.plataforma,
            fechaCreacion: fechaActual
        })

        const ok = {
            ok: "Se ha creado el nuevo deposito",
            depositoUID: deposito.uid
        }
        return ok
    } catch (errorCapturado) {
        throw errorCapturado
    }
}