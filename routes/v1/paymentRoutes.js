import express from "express"
import { authUser } from "../../middlewares/authMiddleware.js"
import { createPayment } from "../../controllers/paymentController.js"

const router = express.Router()

router.route('/create-razorpay-order').post(authUser, createPayment)

export default router
