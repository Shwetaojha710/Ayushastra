const Helper = require("../../helper/helper");
const DoctorConsultationBooking = require("../../model/booking");
const Doctor = require("../../model/doctor");
const prescriptions = require("../../model/prescription");
const { createConsultationBooking } = require("../consultancy/doctors");

exports.getBookings = async(req,res) => {
    try {
        const bookings = await DoctorConsultationBooking.findAll({
          raw:true,
          order:[["id","desc"]]
        });

        const data = await Promise.all(
          bookings.map(async(item)=>{
            const doctordt=await Doctor.findOne({
              where:{
                id:item?.doctor_id  
              }
            })
            return{
                 ...item,
                 doctor_name:doctordt?.name??'NA'
            }
          })
        )

        return Helper.response(true, "Booking List", data, res, 200);
    } catch (error) {
        console.log(error);
        return Helper.response(false, "error", error, res, 500);
    }
}

exports.getDoctorCalendarEvents = async (req, res) => {
  try {
    const doctorId = req.users.id;

    if (!doctorId) {
      return Helper.response(false, "Doctor ID is required", [], res, 400);
    }

    const bookings = await DoctorConsultationBooking.findAll({
      where: { doctor_id: doctorId },
      raw: true
    });

    const formatted =await Promise.all(
 bookings.map(async (b) => {
      const dateParts = b.slot_date.split("-");
      const timeParts = b.slot_time.split(" ");

      const year = Number(dateParts[0]);
      const month = Number(dateParts[1]) - 1;
      const day = Number(dateParts[2]);

      const [hourMin, ampm] = timeParts;
      let [hour, minute] = hourMin.split(":").map(Number);

      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;

      const start = new Date(year, month, day, hour, minute);
      const end = new Date(year, month, day, hour + 1, minute);
      const isExistsBooking=await prescriptions.count({
        where:{
          booking_id:b?.booking_id
        }
      })
     const doctor=await Doctor.findOne({
       where:{
        id:b?.doctor_id
       }
     })
      return {
        id: b.id,
        patient_name: b.name,
        type: b.type || "Online",
        start,
        booking_id:b?.booking_id??0,
        name:doctor?.name??null,
        email:doctor?.email??null,
        phone:doctor?.phone??null,
        age:b?.age??null,
        gender:b?.gender??null,
        dob:b?.dob??null,
        disease:b?.disease??null,
        symptom:b?.symptom??null,
        previous_medicine:b?.previous_medicine??null,
        end,
        status:isExistsBooking?'completed':'pending'
      };
    })
    )

    return Helper.response(true, "Formatted Appointments", formatted, res, 200);

  } catch (error) {
    console.error("Error:", error);
    return Helper.response(false, error.message, [], res, 500);
  }
};


