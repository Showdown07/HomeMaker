import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/env.js";

const generateToken = (id) =>
  jwt.sign({ id }, getJwtSecret(), {
    expiresIn: "7d",
  });

export default generateToken;
