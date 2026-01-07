const cron = require("node-cron");
const moment = require("moment");
const { Op } = require("sequelize");
const DoctorConsultationBooking = require("../../model/booking");

// Runs every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏰ Running booking expiry cron...");

    const now = moment();

    // Fetch pending bookings only
    const bookings = await DoctorConsultationBooking.findAll({
      where: {
        status: "pending",
      },
    });

    for (const booking of bookings) {
      const bookingDateTime = moment(
        `${booking.slot_date} ${booking.slot_time}`,
        "YYYY-MM-DD hh:mm A"
      );

      // If booking time is past
      if (bookingDateTime.isBefore(now)) {
        await booking.update({
          status: "cancelled",
        });

        console.log(
          `❌ Booking ${booking.booking_id} cancelled (expired)`
        );
      }
    }
  } catch (error) {
    console.error("❌ Cron job error:", error);
  }
});
