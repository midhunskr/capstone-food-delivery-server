import express from 'express'
import userRoutes from './userRoutes.js'
import restaurantRoutes from './restaurantRoutes.js'
// import orderRoutes from './orderRoutes.js'
import menuItemRoutes from './menuItemRoutes.js'
import paymentRoutes from './paymentRoutes.js'
import cartRoutes from './cartRoutes.js'

const v1Router = express.Router()

//Import all routes from 'v1'
v1Router.use('/user', userRoutes)
v1Router.use('/restaurant', restaurantRoutes)
// v1Router.use('/order', orderRoutes)
v1Router.use('/menuitem', menuItemRoutes)
v1Router.use('/payment', paymentRoutes)
v1Router.use('/cart', cartRoutes)

export default v1Router