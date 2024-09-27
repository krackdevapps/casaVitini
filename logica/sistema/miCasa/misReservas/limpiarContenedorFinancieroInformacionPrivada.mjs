export const limpiarContenedorFinacieroInformacionPrivada = (data) => {
    try {
        console.log("")
        const contenedorServicios = data.contenedorFinanciero.desgloseFinanciero.entidades?.servicios?.desglosePorServicios || []
        contenedorServicios.forEach(servicio => {
            delete servicio.nombre
        })
    } catch (error) {
        throw error
    }
}