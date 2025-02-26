import { SquareClient, SquareEnvironment } from "square";
import dotenv from "dotenv";
dotenv.config();
const SQUARE_ENTORNO = process.env.SQUARE_ENTORNO
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN

const config = {
  environment: SQUARE_ENTORNO,
  accessToken: SQUARE_ACCESS_TOKEN,

}

const clienteSquare = new SquareClient(config)

export { clienteSquare };
