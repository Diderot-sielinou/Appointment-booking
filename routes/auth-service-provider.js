import express from 'express'
import registerServiceProviderHandle from '../controller/register-serviceProvider-controller.js';
import { loginServiceProviderHandle } from '../controller/login-service_provider.js';

const  router = express.Router(); 

router.post('/register',registerServiceProviderHandle)
router.post('/login',loginServiceProviderHandle)

export default router