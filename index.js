//Import packages
import cors from 'cors'
import express from 'express'
import apiRouter from './routes/index.js'
import cookieParser from 'cookie-parser'
import { connectDB } from './config/db.js'

//Assign express to 'app' variable
const app = express()

//CORS for Authentication
app.use(cors({
  // origin: ['https://chewse-food-delivery.vercel.app', 'http://localhost:5173'],
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.options('*', cors()); // This will respond to preflight requests

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://chewse-food-delivery.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  next();
});


//Parsing incoming JSON requests and puts the parsed data in req.body 
app.use(express.json())
//Parsing incoming cookie
app.use(cookieParser())

//Import PORT from 'env'
const port = process.env.PORT

//Connect Databse from 'config/db'
connectDB()

//Import 'apiRouter' from 'routes/index.js'
app.use('/api', apiRouter)

//Setup port
app.listen(port, () => {
  console.log(`Server started running on port ${port}`)
})