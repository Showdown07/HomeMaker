import dayjs from "dayjs";
import Booking from "../models/Booking.js";

export const isProviderAvailable = async ({
  provider,
  bookingDate,
  slotStart,
  slotEnd,
}) => {
  const dayOfWeek = dayjs(bookingDate).day();
  const availability = provider.availability.find(
    (slot) =>
      slot.dayOfWeek === dayOfWeek &&
      slot.isActive &&
      slot.startTime <= slotStart &&
      slot.endTime >= slotEnd
  );

  if (!availability) {
    return false;
  }

  const clash = await Booking.findOne({
    provider: provider._id,
    bookingDate: {
      $gte: dayjs(bookingDate).startOf("day").toDate(),
      $lte: dayjs(bookingDate).endOf("day").toDate(),
    },
    status: { $in: ["pending", "confirmed", "in-progress"] },
    $or: [
      {
        slotStart: { $lt: slotEnd },
        slotEnd: { $gt: slotStart },
      },
    ],
  });

  return !clash;
};
