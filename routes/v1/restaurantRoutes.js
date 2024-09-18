import express from 'express'
import { admin, authUser } from '../../middlewares/authMiddleware.js'
import { createRestaurant, deleteRestaurant, getRestaurant, getRestaurantById, getRestaurantByMenuItem, updateRestaurant } from '../../controllers/restaurantController.js'
import { upload } from '../../middlewares/uploadMiddleware.js'

const router = express.Router()

//Restaurant routes
router.post('/create', authUser, admin, upload.fields([
    { name: 'menuItems[0].image', maxCount: 1 },
    { name: 'menuItems[1].image', maxCount: 1 },
    { name: 'menuItems[2].image', maxCount: 1 }
  ]), createRestaurant)
router.get('/all-restaurants', authUser, getRestaurant)
router.get('/:id', authUser, getRestaurantById)
router.get('/', authUser, getRestaurantByMenuItem)
router.put('/:id', authUser, admin, updateRestaurant)
router.delete('/:id', authUser, admin, deleteRestaurant)

export default router