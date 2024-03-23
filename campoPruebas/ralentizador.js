const test = async() => {
const selecionoAlgo = document.querySelector("body")
selecionoAlgo.remove()
await new Promise(resolve => setTimeout(resolve, 2000));
selecionoAlgo.style.background = "red"
}
test()