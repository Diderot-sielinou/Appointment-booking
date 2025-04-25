import express from 'express'
import { loginClientValidator, registerClientValidate } from '../validator/auth-clients-validator.js'
import { registerClientHandle } from '../controller/register-client-controller.js'
import { loginClientHandle } from '../controller/login-clent-controller.js'

const router = express.Router()

router.post('/register',registerClientValidate,registerClientHandle)
router.post('/login',loginClientValidator,loginClientHandle)


export default router