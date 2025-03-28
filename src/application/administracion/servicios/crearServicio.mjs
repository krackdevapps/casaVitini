import { Mutex } from "async-mutex";
import { VitiniIDX } from "../../../shared/VitiniIDX/control.mjs";
import { validarServicio } from "../../../shared/servicios/validarObjeto.mjs";
import { insertarServicio } from "../../../infraestructure/repository/servicios/insertarServicio.mjs";
import { obtenerElementoPorElementoUID } from "../../../infraestructure/repository/inventario/obtenerElementoPorElementoUID.mjs";

export const crearServicio = async (entrada) => {
    const mutex = new Mutex();
    try {
        const session = entrada.session
        const IDX = new VitiniIDX(session)
        IDX.administradores()
        IDX.empleados()
        IDX.control()

        await mutex.acquire();

        const servicio = {
            nombreServicio: entrada.body.nombreServicio,
            zonaIDV: entrada.body.zonaIDV,
            contenedor: entrada.body.contenedor
        };

        const servicioValidado = await validarServicio({
            servicio: servicio,
        })

        const testingVI = process.env.TESTINGVI
        if (testingVI) {
            servicioValidado.testingVI = testingVI
        }

        // Verificar que es correcto el uid enlazado

        const gruposDeOpciones = servicioValidado.contenedor.gruposDeOpciones
        for (const gDP of Object.entries(gruposDeOpciones)) {
            const opcionesGrupo = gDP[1].opcionesGrupo

            for (const oDG of opcionesGrupo) {
                const elementoEnlazado = oDG.elementoEnlazado
                if (elementoEnlazado) {
                    const elementoUID = elementoEnlazado.elementoUID
                    const elementoInventario = await obtenerElementoPorElementoUID(elementoUID)
                    if (!elementoInventario) {
                        throw new Error(`No se reconode el elementoUID ${elementoUID} del elemento de invetario para enlazar`)
                    }
                    elementoEnlazado.nombre = elementoInventario.nombre

                    /// Validar el uid del elemento enlazado del inventario                   
                }
            }
        }

        servicioValidado.estadoIDV = "desactivado"
        const nuevoServicio = await insertarServicio(servicioValidado);
        if (nuevoServicio) {
            const ok = {
                ok: "Se ha añadido correctamente el servicio",
                nuevoServicioUID: nuevoServicio.servicioUID
            };
            return ok

        } else {
            const error = "Ha ocurrido un error interno y no se ha podido obtener el nuevo servicio";
            throw new Error(error);
        }
     

    } catch (errorCapturado) {
        throw errorCapturado
    } finally {
        if (mutex) {
            mutex.release();
        }
    }
}