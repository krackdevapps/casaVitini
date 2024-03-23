import { Client, Environment, ApiError } from "square";
import dotenv from "dotenv";
dotenv.config();
const SQUARE_ENTORNO = process.env.SQUARE_ENTORNO
const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN
// Square client config
const config = {
  environment: SQUARE_ENTORNO,
  accessToken: SQUARE_ACCESS_TOKEN,
  // userAgentDetail: "sample_app_node_payment" // Remove or replace this detail when building your own app
}
// Configure instance of Square client
const clienteSquare = new Client(config)
//module.exports = defaultClient
export { clienteSquare };
