
export const sharedMethods = {
    bannerIDX: function (metadatos) {
        const usuarioIDX = metadatos.usuarioIDX

        const rolIDV = metadatos.rolIDV
        const rolUITexto = rolIDV.substring(0, 1).toUpperCase() + rolIDV.substring(1);
        const contenedorUsuarioIDX = document.createElement("div")
        contenedorUsuarioIDX.classList.add("detallesUsuario_contenedorUsuarioIDX")
        contenedorUsuarioIDX.setAttribute("componente", "contenedorUsuarioUX")
        const esferaUsuario = document.createElement("div")
        esferaUsuario.classList.add("detallesUsuario_esferaUsuario")
        esferaUsuario.setAttribute("componente", "esferaUsuario")
        contenedorUsuarioIDX.appendChild(esferaUsuario)
        const contenedorDatosGlobales = document.createElement("div")
        contenedorDatosGlobales.classList.add("detallesUsuario_contenedorDatosGlobales")
        contenedorDatosGlobales.setAttribute("componente", "contenedorDatosGlobales")
        const usuarioIDXUI = document.createElement("div")
        usuarioIDXUI.classList.add("detallesUsuario_usuarioUI")
        usuarioIDXUI.setAttribute("usuarioIDX", usuarioIDX)
        usuarioIDXUI.textContent = usuarioIDX
        contenedorDatosGlobales.appendChild(usuarioIDXUI)
        const rolUI = document.createElement("div")
        rolUI.classList.add("detallesUsuario_rolUI")
        rolUI.setAttribute("componente", "rolUI")
        rolUI.textContent = rolUITexto
        contenedorDatosGlobales.appendChild(rolUI)
        contenedorUsuarioIDX.appendChild(contenedorDatosGlobales)
        return contenedorUsuarioIDX
    }

}