import express from 'express'
import { checkUser, deleteUser, getAllUsers, loginUser, logoutUser, registerUser, userProfile } from '../../controllers/userController.js'
import { admin, authUser } from '../../middlewares/authMiddleware.js'

const router = express.Router()

//User sign-up and sign-in
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', authUser, userProfile)
router.post('/profile/admin/:id', authUser, admin, userProfile)
router.get('/all-users', authUser, admin, getAllUsers)
router.delete('/:id', authUser, admin, deleteUser)
router.post('/logout', authUser, logoutUser)

//Check user from Frontend
router.get('/check-user', authUser, checkUser)

export default router