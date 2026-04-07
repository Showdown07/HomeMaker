export const requireFields = (payload, fields) => {
  const missing = fields.filter((field) => payload[field] === undefined || payload[field] === "");
  return missing;
};

export const isValidEmail = (email = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

export const isStrongPassword = (password = "") => String(password).trim().length >= 6;

export const isTimeSlot = (value = "") => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

export const isIsoDate = (value = "") => !Number.isNaN(Date.parse(value));
