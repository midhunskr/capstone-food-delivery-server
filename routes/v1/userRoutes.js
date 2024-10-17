import express from 'express'
import { addAddress, checkUser, deleteAddress, deleteUser, getAllUsers, getUserAddresses, loginUser, logoutUser, registerUser, updateAddress, updateUser, userProfile } from '../../controllers/userController.js'
import { admin, authUser } from '../../middlewares/authMiddleware.js'

const router = express.Router()

//User sign-up, sign-in, profile
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', authUser, userProfile)
router.put('/update', authUser, updateUser);
router.post('/profile/admin/:id', authUser, admin, userProfile)
router.get('/all-users', authUser, admin, getAllUsers)
router.delete('/:id', authUser, admin, deleteUser)
router.post('/logout', authUser, logoutUser)

//Check user from Frontend
router.get('/check-user', authUser, checkUser)

//Address
router.post('/address', authUser, addAddress);
router.get('/addresses', authUser, getUserAddresses);
router.put('/address/:id', authUser, updateAddress);
router.delete('/address/:id', authUser, deleteAddress);

export default router