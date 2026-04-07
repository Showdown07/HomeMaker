import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  getAdminBookings,
  getAdminLocalContacts,
  getAdminOverview,
  getAdminReviews,
  getAdminServices,
  getAdminUsers,
  getAdminHelpRequests,
  createLocalContact,
  deleteLocalContact,
  toggleServiceActivation,
  updateHelpRequestStatus,
  updateLocalContact,
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
router.get("/local-contacts", getAdminLocalContacts);
router.post("/local-contacts", createLocalContact);
router.put("/local-contacts/:id", updateLocalContact);
router.delete("/local-contacts/:id", deleteLocalContact);
router.get("/help-requests", getAdminHelpRequests);
router.put("/help-requests/:id/status", updateHelpRequestStatus);

export default router;
