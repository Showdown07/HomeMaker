import Notification from "../models/Notification.js";
import { emitNotification } from "../config/socket.js";

export const createNotification = async ({
  recipient,
  title,
  message,
  type = "info",
  meta = {},
}) => {
  const notification = await Notification.create({
    recipient,
    title,
    message,
    type,
    meta,
  });

  emitNotification(recipient.toString(), notification);
  return notification;
};
