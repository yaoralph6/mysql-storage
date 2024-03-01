import express from "express"
import * as dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import { userRouter } from "./USERS/users.routes"
import { productRouter } from "./PRODUCTS/products.routes"
import * as mysql from "mysql2/promise";

dotenv.config()

if (!process.env.PORT) {
	console.log('No port value specified... ')
}

const PORT = parseInt(process.env.PORT as string, 10)

const app = express()

  


app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors())
app.use(helmet())

app.use('/', userRouter)
app.use('/', productRouter)

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
  });
  
  export const connection = pool.getConnection(); 
  
  async function main() {
	try {
		const connection = await pool.getConnection(); 
		await connection.ping(); 
		console.log("Successfully connected to MySQL database");
	
		
	
		app.listen(PORT, () => {
		  console.log(`Server listening on port ${PORT}`);
		});
	  } catch (error) {
		console.error("Error connecting to MySQL database:", error);
		process.exit(1); 
	  }
	}
	
	main(); 