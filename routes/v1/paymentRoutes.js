import express from "express"
import { authUser } from "../../middlewares/authMiddleware.js"
import { createPayment, getUserOrders } from "../../controllers/paymentController.js"

const router = express.Router()

router.route('/create-razorpay-order').post(authUser, createPayment)
router.route('/get-user-orders').get(authUser, getUserOrders)

export default router
