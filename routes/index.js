import e from "express"
import v1Router from "./v1/index.js"

const apiRouter = e.Router()

//Import 'v1Router' from 'v1/index.js'
apiRouter.use('/v1', v1Router)



export default apiRouter