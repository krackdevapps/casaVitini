import { existsSync } from 'fs'
import { filtroError } from '../../src/shared/error/filtroError.mjs';

export const puerto = async (entrada, salida) => {
    try {

        const zonaRaw = entrada.body.zona;
        delete entrada.body.zona
        if (!zonaRaw) {
            const error = "zonaIndefinida";
            throw new Error(error);
        }
        const filtroZona = /^[a-zA-Z\/\-_]+$/;
        const tipoEntrada = typeof zonaRaw
        if (tipoEntrada !== "string") {
            const error = "Las rutas de las zonas se esperan que esten especificadas como cadenas";
            throw new Error(error);
        }
        if (!filtroZona.test(zonaRaw)) {
            const error = "Las rutas de las zonas solo admiten minúsculas y mayúsculas junto con barras, nada más ni siquiera espacios.";
            throw new Error(error);
        }
        const arbol = zonaRaw
            .split("/")
            .filter(rama => rama.trim() !== "")

        if (!arbol) {
            const error = "arbolNoDefinido";
            throw new Error(error);
        }

        const directorioRaiz = process.cwd();
        const pathControllers = directorioRaiz + "/src/application/" + zonaRaw + ".mjs"

        if (existsSync(pathControllers)) {

            const controllerSelected = await import(pathControllers)
            const nombreMetodo = arbol.pop();
            if (typeof controllerSelected[nombreMetodo] === 'function') {
                const respuesta = await controllerSelected[nombreMetodo](entrada, salida);
                salida.json(respuesta)

            } else {
                const error = "Dentro de esta zona no hay ninguna función."
                throw new Error(error)
            }
        } else {
            const error = "Dentro de esta zona no hay ninguna controlador."
            throw new Error(error)
        }

    } catch (errorCapturado) {
        console.error("errorCapturado", errorCapturado.stack);
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}
