import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAdminBookings,
  getAdminOverview,
  getAdminReviews,
  getAdminServices,
  getAdminUsers,
  toggleServiceActivation,
  updateUserRole,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/overview", getAdminOverview);
router.get("/users", getAdminUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/services", getAdminServices);
router.put("/services/:id/status", toggleServiceActivation);
router.get("/bookings", getAdminBookings);
router.get("/reviews", getAdminReviews);

export default router;
