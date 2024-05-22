import fs from 'fs'
import path from 'path';
import { filtroError } from '../sistema/error/filtroError.mjs';

export const puerto = async (entrada, salida) => {
    try {
        const zonaRaw = entrada.body.zona;
        if (!zonaRaw) {
            const error = "zonaIndefinida";
            throw new Error(error);
        }
        const filtroZona = /^[a-zA-Z\/\-_]+$/;
        if (!filtroZona.test(zonaRaw)) {
            const error = "Las rutas de la zonas solo admiten minusculas y mayusculas junto con barras, nada mas ni siqueira espacios";
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
        const contructorArbol = async (zonaBusqueda) => {
            try {
                const arbol = {}
                const cargarModulosDesdeDirectorio = async (rutaActual, arbol) => {
                    const arbolDeLaRuta = await fs.promises.readdir(rutaActual, { withFileTypes: true })
                    for (const ramaDeLaRuta of arbolDeLaRuta) {
                        const rutaEntrada = path.join(ramaDeLaRuta.path, ramaDeLaRuta.name)
                        if (ramaDeLaRuta.isDirectory()) {
                            arbol[ramaDeLaRuta.name] = {}
                            await cargarModulosDesdeDirectorio(rutaEntrada, arbol[ramaDeLaRuta.name])
                        } else if (ramaDeLaRuta.isFile() && ramaDeLaRuta.name.endsWith('.mjs')) {
                            const nombreModulo = ramaDeLaRuta.name.replace('.mjs', '')
                            //console.log("rutaEntrada", rutaEntrada)
                            const rutaDeImportacion = path.relative('./zonas/logica', rutaEntrada)
                            arbol[nombreModulo] = await import(rutaDeImportacion)
                        }
                    }
                }
                await cargarModulosDesdeDirectorio(zonaBusqueda, arbol)
                return arbol
            } catch (errorCapturado) {
                throw errorCapturado
            }
        }

        const directorioZonas = './logica/zonas'
        const zonas = await contructorArbol(directorioZonas)

        const exploradorArbol = (zonas, ruta) => {
            const partes = ruta.split('.')
            let rama = zonas;
            for (const part of partes) {
                if (rama && typeof rama === 'object' && rama.hasOwnProperty(part)) {
                    rama = rama[part]
                } else {
                    const error = "zonaInexistente1"
                    throw new Error(error)
                }
            }
            return rama
        }
        const estructura = exploradorArbol(zonas, ruta)
        const X = estructura[arbol.pop()]
        if (typeof X !== "function") {
            const error = "zonaInexistente2"
            throw new Error(error)
        }
        const respuesta = await X(entrada, salida)
        salida.json(respuesta)
    } catch (errorCapturado) {
        const errorFinal = filtroError(errorCapturado)
        salida.json(errorFinal)
    }
}
