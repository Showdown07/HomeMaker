import express from "express";
import {
  createService,
  deleteService,
  getServiceById,
  getProviderServices,
  getServices,
  updateService,
} from "../controllers/serviceController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(getServices).post(protect, authorize("provider", "admin"), createService);
router.get("/provider/me", protect, authorize("provider", "admin"), getProviderServices);
router
  .route("/:id")
  .get(getServiceById)
  .put(protect, authorize("provider", "admin"), updateService)
  .delete(protect, authorize("provider", "admin"), deleteService);

export default router;
