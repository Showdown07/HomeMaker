import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import { updateAvailability } from "../controllers/providerController.js";
import { getProviderProfile } from "../controllers/providerPublicController.js";
import { getProviderServices } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/dashboard/services/me", protect, authorize("provider"), getProviderServices);
router.put("/availability/me", protect, authorize("provider"), updateAvailability);
router.get("/:id", getProviderProfile);

export default router;
