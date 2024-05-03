import fs from 'fs';
const cambiarVista = async (transaccion) => {
    try {
        let vista = transaccion.vista
        let arbol = vista.split("/")
        arbol = arbol.filter(n => n)
        const usuarioIDX = transaccion.usuario
        const rolIDX = transaccion.rol
        let selectorRama = './ui/vistas'
        let urlResuelta = "";
        // si solo hay adminitracion
        let zona = arbol[0].toLowerCase()
        if (arbol.length > 1 && arbol[0].toLowerCase() === "administracion") {
            zona = arbol[1].toLowerCase()
        }
        const controlFiltro = /^[a-z0-9_]+$/;
        let portal
        for (let rama of arbol) {
            rama = rama.toLowerCase()
            if (controlFiltro.test(rama)) {
                selectorRama = selectorRama + "/" + rama
       
                if (fs.existsSync(selectorRama)) {
                    const archivoIDX = selectorRama + "/IDX"
                    if (fs.existsSync(archivoIDX)) {
                        if (!usuarioIDX) {
                            portal = "IDX"
                            urlResuelta = ""
                            break
                        }
                        let roles = fs.readFileSync(archivoIDX, 'utf-8');
                        roles = roles.replaceAll(" ", "")
                        roles = roles.split(",")
                        roles = roles.filter(espacio => espacio)
                        if (roles.length > 0 && !roles.includes(rolIDX)) {
                            portal = "ROL"
                            urlResuelta = ""
                            break
                        }
                    }
                } else {
                    break
                }
                urlResuelta = urlResuelta + "/" + rama
            } else {
                break
            }
        }
        // Contructor Parametros
        let parametros = []
        let urlResueltoParseador = urlResuelta.split("/")
        urlResueltoParseador = urlResueltoParseador.filter(rama => rama)
        arbol.map((parametroPorResolver, posicion) => {
            parametroPorResolver = parametroPorResolver.toLowerCase()
            if (parametroPorResolver !== urlResueltoParseador[posicion]) {
                parametros.push(parametroPorResolver)
            }
        })
        parametros = "/" + parametros.join("/")
        parametros = parametros !== "/" ? parametros : ""
        const urlResultaConParametros = urlResuelta + parametros
        urlResuelta = urlResuelta === "/micasa/portal" ? "" : urlResuelta
        urlResuelta = urlResuelta === "/micasa/rol" ? "" : urlResuelta
        let vistaSelector = "./ui/vistas" + urlResuelta + "/vista.ejs"
        if (urlResuelta === "/micasa") {
            if (usuarioIDX) {
                vistaSelector = "./ui/vistas/micasa/portal/portada.ejs"
            } else {
                vistaSelector = "./ui/vistas/micasa/portal/vista.ejs"
            }
        }
        if (portal === "IDX") {
            vistaSelector = "./ui/vistas/micasa/portal/vista.ejs"
        }
        if (portal === "ROL") {
            vistaSelector = "./ui/vistas/micasa/rol/vista.ejs"
        }

        if (fs.existsSync(vistaSelector)) {
            const vistaCodigo = fs.readFileSync(vistaSelector, 'utf-8');
            const ok = {
                zona: zona,
                url: urlResultaConParametros,
                ok: vistaCodigo
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
export {
    cambiarVista
};