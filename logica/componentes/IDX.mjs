export const IDX = (ID) => {
    
    let IDX = ID.VitiniID
    if (!IDX) {
        let Error = {
            "IDX": "Desconectado"
        }
       return Error
    }
    
    return IDX;
}
