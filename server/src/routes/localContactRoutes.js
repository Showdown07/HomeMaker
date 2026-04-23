import express from "express";
import { getPublicLocalContacts } from "../controllers/localContactController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("user", "admin"), getPublicLocalContacts);

export default router;
