import jwt from 'jsonwebtoken'

export const generateUserToken =(id, role) => {
    const token = jwt.sign({ id, role}, process.env.JWT_SECRET_KEY)
    return token
}