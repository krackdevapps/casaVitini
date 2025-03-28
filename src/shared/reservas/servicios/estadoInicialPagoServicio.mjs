export const estadoInicialPagoServicio = (data) => {
    const gruposDeOpciones = data.gruposDeOpciones  
    let estadoInicialServicio = "sinCoste"
    
    Object.entries(gruposDeOpciones).forEach(gDO => {
        const [grupoIDV, contenedor] = gDO
        const opcionesGrupo = contenedor.opcionesGrupo
        opcionesGrupo.forEach(oG => {
            const precioOpcion = oG?.precioOpcion
            if (precioOpcion) {
                estadoInicialServicio = "noPagado"
            }
        })
    })
    return estadoInicialServicio
}