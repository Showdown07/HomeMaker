import express from "express";
import { createHelpRequest, getMyHelpRequests } from "../controllers/helpRequestController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, authorize("user", "admin"), createHelpRequest)
  .get(protect, authorize("user", "admin"), getMyHelpRequests);

export default router;
