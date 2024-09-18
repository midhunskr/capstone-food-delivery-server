import express from 'express'
import { admin, authUser } from '../../middlewares/authMiddleware.js'
import { createOrder, deleteOrder, getAllOrdersAdmin, getOrderById, getUserOrders } from '../../controllers/orderController.js'

const router = express.Router()

router.route('/create').post(authUser, createOrder)
router.route('/orders').get(authUser, getUserOrders)
router.route('/all-orders').get(authUser, admin, getAllOrdersAdmin)
router.route('/:id')
    .get(authUser, getOrderById)
    .delete(authUser, admin, deleteOrder)
export default router