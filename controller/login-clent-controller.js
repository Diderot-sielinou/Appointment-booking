import { query } from "../config/db.js"
import logger from "../utils/logger.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function loginClientHandle(req,res,next) {
  const {email,password}= req.body
  try {
    const findClientQuery= `SELECT id,first_name,last_name,email,password,adresse,phone FROM clients WHERE email=$1`
    const clientResult = await query(findClientQuery,[email])
    if(clientResult.rows.length === 0){
      logger.warn(`Login attempt failed: User not found - ${email}`)
      return res.status(401).json({ message: 'Invalid Credentials' })

    }
    const client = clientResult.rows[0]

    const isPassswordMatch = await bcrypt.compare(password, client.password)

    if(!isPassswordMatch){
      logger.warn(`Login attempt failed: Incorrect password - ${email}`)
      return res.status(401).json({ message: "Invalid password" })
    }

    const payload = {
      user: {
        id: client.id,
        email: client.email
      }
    }
    jwt.sign(payload, process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }, (err, token) => {
        if (err) {
          logger.error(`Error generating JWT for ${email}: `, err)
          throw new Error('Error generating authentication toke')
        }
        logger.info(`client logged in successfully: ${email} (ID: ${client.id})`)
        res.status(200).json({
          message: "Login Successfull!",
          token: token,
          client: {
            id: client.id,
            firstName: client.first_name,
            lastName: client.last_name,
            email: client.email,
            adresse:client.adresse,
            phone:client.phone,
            createdAt:client.created_at
          }
        })
      })

  } catch (error) {
    logger.error(`Error during login process for ${email}: `, error)
    res.status(500).json({ message: error.message || "Server error during login" })
  }
}