export const operacionesRegistro = (data) => {

    try {
        const operacionIDV = data.operacionIDV
        const funcion = data.funcion

        const funcionesVal = [
            "traducirUI",
            "comprobarIDV"
        ]
        if (!funcionesVal.includes(funcion)) {
            throw new Error("El validador de operacionesRegistro esta mas configurado funcion solo espera traducirUI oo comprobarIDV")
        }

        if (funcion === "comprobarIDV") {
            const diccionarioIDV = [
                "elementoCreado",
                "cantidadActualizadaDesdeIventario"
            ]
            if (!diccionarioIDV.includes(operacionIDV)) {
                throw new Error("No se reconoce el operacionIDV")
            }
        }
        if (funcion === "traducirUI") {
            const diccionarioOperaciones = {
                elementoCreado: {
                    operacionUI: "Elemento creado",
                    definicion: "Este registro informa en qué fecha fue creado el elemento en el inventario general. Este registro se creó al crear el elemento en el inventario",
                },

                cantidadActualizadaDesdeInventario: {
                    operacionUI: "Cantidad actualizada desde el inventario",
                    definicion: "Este registro se creó cuando se alteró la cantidad de este elemento desde el menú del elemento dentro del inventario."
                }
            }



            return diccionarioOperaciones[operacionIDV]


        }

    } catch (error) {
        throw error
    }

}