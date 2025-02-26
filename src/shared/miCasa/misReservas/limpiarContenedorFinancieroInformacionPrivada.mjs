export const limpiarContenedorFinacieroInformacionPrivada = (data) => {
    try {
        const contenedorServicios = data.contenedorFinanciero.desgloseFinanciero.entidades?.servicios?.desglosePorServicios || []
        contenedorServicios.forEach(c => delete c.servicio.nombre)
    } catch (error) {
        throw error
    }
}