
import express from "express"
const router = express.Router()

import AuthController from "../controllers/authController.js"


// * <================ POST ============================>

// router.post("/registration", AuthController.registration)

router.post("/login", AuthController.login)

router.post("/logout", AuthController.logout)

// Через body
router.post("/refresh", AuthController.refresh)


// * <================ GET ============================>

// Через cookie
router.get("/refresh", AuthController.refresh)




export default router