import express from "express"
import { authUser } from "../../middlewares/authMiddleware.js"
import { clearCart, getCart, updateCart } from "../../controllers/cartController.js"

const router = express.Router()

router.route('/update').post(authUser, updateCart)
router.route('/').get(authUser, getCart)
router.route('/clear').delete(authUser, clearCart)

export default router