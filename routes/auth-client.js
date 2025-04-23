import express from 'express'
import { registerClientValidate } from '../validator/auth-clients-validator.js'
import { registerClientHandle } from '../controller/register-client-controller.js'

const router = express.Router()

router.post('/register',registerClientValidate,registerClientHandle)


export default router