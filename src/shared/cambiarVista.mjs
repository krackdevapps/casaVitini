import { existsSync, readFileSync, readFile } from 'fs';
import { secPort } from './secOps/secPort.mjs';
export const cambiarVista = async (entrada) => {
    try {
        const vista = entrada.vista
        const arbol = vista.split("/").filter(n => n)
        let selectorRama = './ui/vistas/public'
        let urlResuelta = "";
        if (arbol.length === 0) {
            const m = "Vista debe tener datos del directorio, pasar solo una barra no es el formato esperado."
            throw new Error(m)
        }
        let zona = arbol[0].toLowerCase()
        if (arbol.length > 1 && arbol[0].toLowerCase() === "administracion") {
            zona = arbol[1].toLowerCase()
        }

        const controlFiltro = /^[a-z0-9_]+$/;
        for (let rama of arbol) {
            rama = rama.toLowerCase()
            if (controlFiltro.test(rama)) {
                selectorRama = selectorRama + "/" + rama
                if (!existsSync(selectorRama)) {
                    break
                }
                urlResuelta = urlResuelta + "/" + rama
            } else {
                break
            }
        }
        const portal = await secPort({
            arbol: arbol,
            usuario: entrada.usuario,
            tipoPermiso: "vista"
        })
        
        //let portal
        let parametros = []
        let urlResueltoParseador = urlResuelta.split("/")
        urlResueltoParseador = urlResueltoParseador.filter(rama => rama)
        arbol.forEach((parametroPorResolver, posicion) => {
            parametroPorResolver = parametroPorResolver.toLowerCase()
            if (parametroPorResolver !== urlResueltoParseador[posicion]) {
                parametros.push(parametroPorResolver)
            }
        })
        parametros = "/" + parametros.join("/")
        parametros = parametros !== "/" ? parametros : ""
        const urlResultaConParametros = urlResuelta + parametros

        let vistaSelector = "./ui/vistas/public" + urlResuelta + "/ui.ejs"

        let jsOptionalSelector
        let cssOptionalSelector
        if (portal === "IDX") {
            urlResuelta = "/sys/portal/login"
            vistaSelector = "./ui/vistas/sys/login/ui.ejs"

            jsOptionalSelector = "./ui/vistas/sys/login/ui.js"
            cssOptionalSelector = "./ui/vistas/sys/login/ui.css"
        } else if (portal === "ROL") {
            urlResuelta = "/sys/portal/rol"
            vistaSelector = "./ui/vistas/sys/rol/ui.ejs"
            jsOptionalSelector = "./ui/vistas/sys/rol/ui.js"
            cssOptionalSelector = "./ui/vistas/sys/rol/ui.css"
        } else {
            jsOptionalSelector = "./ui/vistas/public" + urlResuelta + "/ui.js"
            cssOptionalSelector = "./ui/vistas/public" + urlResuelta + "/ui.css"
        }




        if (existsSync(vistaSelector)) {

            const html = readFileSync(vistaSelector, 'utf-8');

            let js = ""
            let css = ""
            if (existsSync(jsOptionalSelector)) {
                js = readFileSync(jsOptionalSelector, 'utf-8')
            }

            if (existsSync(cssOptionalSelector)) {
                css = readFileSync(cssOptionalSelector, 'utf-8')
            }


            let sharedMethods = ""
            const checkSharedMethods = "./ui/vistas/public" + urlResuelta + "/getSharedMethods.mjs"
            if (existsSync(checkSharedMethods)) {
                const sharedMethodsFile = "../../ui/vistas/public" + urlResuelta + "/getSharedMethods.mjs"
                const sharedMethodsImported = await import(sharedMethodsFile);

                const serializeFunctions = (obj) => {
                    let cadena = '{';
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (typeof obj[key] === 'function') {
                                cadena += `${key}: ${obj[key].toString()}, `;
                            }
                            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                                cadena += `${key}: ${serializeFunctions(obj[key])}, `;
                            }
                            else {
                                cadena += `${key}: "${obj[key]}", `;
                            }
                        }
                    }
                    cadena = cadena.replace(/, $/, '') + '}';
                    return cadena;
                }

                const shared = sharedMethodsImported.shared()
                const serializedMethods = serializeFunctions(shared);
                const lastFormating = `casaVitini.view.__sharedMethods__ = ${serializedMethods}`
                sharedMethods = lastFormating;
            }

            const ok = {
                ok: "Vista encontrada",
                zona: zona,
                url: urlResultaConParametros,
                urlWithoutParams: "/" + urlResueltoParseador.join("/"),
                params: parametros,
                html: html,
                js: js,
                sharedMethods: sharedMethods,
                css: css
            }
            return ok
        } else {
            const error = "noExisteLaVista"
            throw new Error(error)
        }
    } catch (error) {

        throw error;
    }
}
