export const controlTotalNetoAlojamiento = (data) => {
    const totalNetoConComplementos = data?.totalNetoConComplementos
    const totalNetoSinComplementos = data?.totalNetoSinComplementos
    if (!totalNetoConComplementos || totalNetoConComplementos === "0.00") {
        return totalNetoSinComplementos
    } else {
        return totalNetoConComplementos
    }
}