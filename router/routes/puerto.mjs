import fs from 'fs'
import path from 'path';
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

        const ruta = arbol.join(".")
        const constructorArbol = async (zonaBusqueda) => {
            const arbol = {}
            const cargarModulosDesdeDirectorio = async (rutaActual, arbol) => {
                const arbolDeLaRuta = await fs.promises.readdir(rutaActual, { withFileTypes: true })
                for (const ramaDeLaRuta of arbolDeLaRuta) {
                    const rutaEntrada = path.join(ramaDeLaRuta.parentPath, ramaDeLaRuta.name)
                    if (ramaDeLaRuta.isDirectory()) {
                        arbol[ramaDeLaRuta.name] = {}
                        await cargarModulosDesdeDirectorio(rutaEntrada, arbol[ramaDeLaRuta.name])
                    } else if (ramaDeLaRuta.isFile() && ramaDeLaRuta.name.endsWith('.mjs')) {
                        const nombreModulo = ramaDeLaRuta.name.replace('.mjs', '')
                        const rutaDeImportacion = path.relative('./application/logica', rutaEntrada)
                        arbol[nombreModulo] = await import(rutaDeImportacion)
                    }
                }
            }
            await cargarModulosDesdeDirectorio(zonaBusqueda, arbol)
            return arbol
        }

        const directorioZonas = './src/application'
        const zonas = await constructorArbol(directorioZonas)
        const exploradorArbol = (zonas, ruta) => {
            const partes = ruta.split('.')
            let rama = zonas;
            for (const part of partes) {
                if (rama && typeof rama === 'object' && rama.hasOwnProperty(part)) {
                    rama = rama[part]
                } else {
                    const error = "No se encuentra la zona."
                    throw new Error(error)
                }
            }
            return rama
        }

        const estructura = exploradorArbol(zonas, ruta)
        const X = estructura[arbol.pop()]
        if (typeof X !== "function") {
            const error = "Dentro de esta zona no hay ninguna función."
            throw new Error(error)
        }

        const respuesta = await X(entrada, salida)
        salida.json(respuesta)
    } catch (errorCapturado) {
        console.error("errorCapturado", errorCapturado.stack);
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}
