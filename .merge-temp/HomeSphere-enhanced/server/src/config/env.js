const defaultClientOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

export const getAllowedOrigins = () => {
  const configured = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [];

  return configured.length ? configured : defaultClientOrigins;
};

export const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return process.env.JWT_SECRET;
};

export const getPort = () => Number(process.env.PORT) || 5000;
