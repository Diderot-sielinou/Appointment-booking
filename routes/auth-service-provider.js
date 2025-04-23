import express from 'express'
import registerServiceProviderHandle from '../controller/register-serviceProvider-controller.js';

const  router = express.Router(); 

router.post('/register',registerServiceProviderHandle)

export default router