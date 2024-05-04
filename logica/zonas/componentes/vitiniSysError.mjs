export class vitiniSysError extends Error {
    constructor(errorObjeto) {
        super(JSON.stringify(errorObjeto));
        this.objeto = errorObjeto;
    }
}
