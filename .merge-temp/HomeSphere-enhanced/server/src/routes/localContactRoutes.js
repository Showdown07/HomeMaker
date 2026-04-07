import express from "express";
import { getPublicLocalContacts } from "../controllers/localContactController.js";

const router = express.Router();

router.get("/", getPublicLocalContacts);

export default router;
