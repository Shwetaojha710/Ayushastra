const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const db = require("../connection/connection");
const fs = require("fs");
const path = require("path");
const os = require("os");
const Helper = {};
const axios = require("axios");
const admin=require('../notification/notification')
Helper.basicAmountCalc = (amount, typeValue) => {
  return parseFloat(((amount || 0) * (typeValue || 0)) / 100);
};

Helper.deleteUploadedFiles = (files) => {
  if (!files || typeof files !== "object") return;

  try {
    for (const key in files) {
      const fileArray = Array.isArray(files[key]) ? files[key] : [files[key]];

      for (const file of fileArray) {
        if (file?.filename) {
          const filePath = path.join(
            __dirname,
            "../../../upload",
            file.filename
          );
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error deleting uploaded files:", err);
  }
};
Helper.getCurrentDate = () => {
  const date = new Date();
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return date.toLocaleDateString("en-IN", options).replace(/\//g, "-");
};

Helper.formatToIST = (
  datetime = new Date(),
  format = "YYYY-MM-DD HH:mm:ss"
) => {
  return moment(datetime).tz("Asia/Kolkata").format(format);
};

Helper.response = (status, message, data = [], res, statusCode) => {
  return res.status(statusCode).json({
    status,
    message,
    data,
  });
};

Helper.verifyToken = (token) => {
  try {
    const secret = process.env.SECRET_KEY || "your_jwt_secret";
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

Helper.getDesig = async (tenantId, branchId) => {
  try {
    const query = `SELECT * FROM designations where "tenantId" = '${tenantId}' and "branchId" ='${branchId}' `;
    const rows = await db.query(query);
    return rows[0];
  } catch (err) {
    console.error("DB Error in getDesig:", err);
    return [];
  }
};

Helper.validateAccountNumber = (accountNumber) => {
  const accountRegex = /^\d{11,18}$/;
  return accountRegex.test(accountNumber);
};

Helper.isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
Helper.isValidAadhaar = (aadhaar) => /^\d{12}$/.test(aadhaar);
Helper.isValidPAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
Helper.isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
Helper.isValidDOB = (dob) =>
  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/.test(dob);

Helper.isAgeAbove18 = (age) => age >= 18;

Helper.formatShiftTime = (shift) => {
  if (!shift || !shift.startTime || !shift.endTime) return shift;

  const jsonShift = shift.toJSON ? shift.toJSON() : shift;

  return {
    ...jsonShift,
    startTime: moment(jsonShift.startTime, "HH:mm:ss").format("hh:mm A"),
    endTime: moment(jsonShift.endTime, "HH:mm:ss").format("hh:mm A"),
  };
};

Helper.calculateWorkingHours = (startTime, endTime) => {
  const start = moment(startTime, "HH:mm");
  const end = moment(endTime, "HH:mm");
  const durationInHours = moment.duration(end.diff(start)).asHours();
  return parseFloat(durationInHours.toFixed(2));
};

Helper.capitalizeFirstLetter = (name) => {
  if (name.length === 0) {
    return "";
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
};

Helper.getIpAddress = (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    null;

  // Remove IPv6 prefix if present
  if (ip && ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  return ip;
};

Helper.dateFormat = (date) => {
  const istDate = new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 12-hour format (AM/PM)
    timeZone: "Asia/Kolkata",
  });

  return istDate.replace(/\b(am|pm)\b/, (match) => match.toUpperCase());
};
Helper.newDateFormat = (date) => {
  const istDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    weekday: "short",
  });

  return istDate;
};

Helper.applySandwichRule = (leaveRecords, holidays, startDate, endDate) => {
  let updatedRecords = [...leaveRecords];

  // Build a Set of all leave dates for quick lookup
  let leaveDates = new Set();
  for (const leave of leaveRecords) {
    let start = moment(leave.fromDate);
    let end = moment(leave.toDate);
    for (let d = moment(start); d <= end; d.add(1, "days")) {
      leaveDates.add(d.format("YYYY-MM-DD"));
    }
  }

  for (let d = moment(startDate); d <= endDate; d.add(1, "days")) {
    const dateKey = d.format("YYYY-MM-DD");

    // skip if already leave
    if (leaveDates.has(dateKey)) continue;

    // check if this day is a weekend or a tenant holiday
    const isHoliday =
      holidays.includes(dateKey) || d.day() === 0 || d.day() === 6;
    if (!isHoliday) continue;

    // sandwich condition → leave must exist just before & just after
    const prevDay = moment(d).subtract(1, "days").format("YYYY-MM-DD");
    const nextDay = moment(d).add(1, "days").format("YYYY-MM-DD");

    if (leaveDates.has(prevDay) && leaveDates.has(nextDay)) {
      updatedRecords.push({
        id: uuidv4(),
        employeeId: leaveRecords[0].employeeId,
        leaveTypeId: leaveRecords[0].leaveTypeId,
        fromDate: dateKey,
        toDate: dateKey,
        duration_type: "full",
        isSandwich: true,
        status: leaveRecords[0].status,
        tenantId: leaveRecords[0].tenantId,
      });
      leaveDates.add(dateKey); // mark it as leave for further checks
    }
  }

  return updatedRecords;
};

// Helper.applySandwichRule = (leaveRecords, holidays, startDate, endDate) => {
//   let updatedRecords = [...leaveRecords];

//   // Convert leaveRecords into a Set of leave dates for quick lookup
//   let leaveDates = new Set();
//   for (const leave of leaveRecords) {
//     let start = moment(leave.fromDate);
//     let end = moment(leave.toDate);
//     for (let d = moment(start); d <= end; d.add(1, "days")) {
//       leaveDates.add(d.format("YYYY-MM-DD"));
//     }
//   }

//   for (let d = moment(startDate); d <= endDate; d.add(1, "days")) {
//     const dateKey = d.format("YYYY-MM-DD");

//     // skip if already leave
//     if (leaveDates.has(dateKey)) continue;

//     const isHoliday = holidays.includes(dateKey) || d.day() === 0 || d.day() === 6;
//     if (!isHoliday) continue;

//     // find nearest previous leave
//     let prev = moment(d).subtract(1, "days");
//     while (prev >= startDate) {
//       const prevKey = prev.format("YYYY-MM-DD");
//       if (leaveDates.has(prevKey)) break;
//       if (!(holidays.includes(prevKey) || prev.day() === 0 || prev.day() === 6)) {
//         prev = null;
//         break;
//       }
//       prev.subtract(1, "days");
//     }

//     // find nearest next leave
//     let next = moment(d).add(1, "days");
//     while (next <= endDate) {
//       const nextKey = next.format("YYYY-MM-DD");
//       if (leaveDates.has(nextKey)) break;
//       if (!(holidays.includes(nextKey) || next.day() === 0 || next.day() === 6)) {
//         next = null;
//         break;
//       }
//       next.add(1, "days");
//     }

//     // if leave exists on both sides → mark as sandwich leave
//     if (prev && next) {
//       updatedRecords.push({
//         id: uuidv4(),
//         employeeId: leaveRecords[0].employeeId,
//         leaveTypeId: leaveRecords[0].leaveTypeId,
//         fromDate: dateKey,
//         toDate: dateKey,
//         duration_type: "full",
//         isSandwich: true,
//         status: leaveRecords[0].status,
//        tenantId:leaveRecords[0].tenantId,
//        leaveTypeId:leaveRecords[0].leaveTypeId
//       });
//       leaveDates.add(dateKey);
//     }
//   }

//   return updatedRecords;
// };

// Helper.applySandwichRule = (leaveRecords, holidays, startDate, endDate) => {
//   let updatedRecords = [...leaveRecords];

//   // Convert leaveRecords into a Set of leave dates for quick lookup
//   let leaveDates = new Set();
//   for (const leave of leaveRecords) {
//     let start = moment(leave.fromDate);
//     let end = moment(leave.toDate);
//     for (let d = moment(start); d <= end; d.add(1, "days")) {
//       leaveDates.add(d.format("YYYY-MM-DD"));
//     }
//   }

//   for (let d = moment(startDate); d <= endDate; d.add(1, "days")) {
//     const dateKey = d.format("YYYY-MM-DD");

//     // skip if already leave
//     if (leaveDates.has(dateKey)) continue;

//     const isHoliday = holidays.includes(dateKey) || d.day() === 0 || d.day() === 6;
//     if (!isHoliday) continue;

//     // find nearest previous leave
//     let prev = moment(d).subtract(1, "days");
//     while (prev >= startDate) {
//       const prevKey = prev.format("YYYY-MM-DD");
//       if (leaveDates.has(prevKey)) break;
//       if (!(holidays.includes(prevKey) || prev.day() === 0 || prev.day() === 6)) {
//         prev = null;
//         break;
//       }
//       prev.subtract(1, "days");
//     }

//     // find nearest next leave
//     let next = moment(d).add(1, "days");
//     while (next <= endDate) {
//       const nextKey = next.format("YYYY-MM-DD");
//       if (leaveDates.has(nextKey)) break;
//       if (!(holidays.includes(nextKey) || next.day() === 0 || next.day() === 6)) {
//         next = null;
//         break;
//       }
//       next.add(1, "days");
//     }

//     // if leave exists on both sides → mark as sandwich leave
//     if (prev && next) {
//       updatedRecords.push({
//         id: null,
//         employeeId: leaveRecords[0].employeeId,
//         leaveTypeId: null,
//         fromDate: dateKey,
//         toDate: dateKey,
//         duration_type: "full",
//         isSandwich: true,
//         tenantId: leaveRecords[0].tenantId,
//         leaveTypeId: leaveRecords[0].leaveTypeId
//       });
//       leaveDates.add(dateKey);
//     }
//   }

//   return updatedRecords;
// };
const { v4: uuidv4 } = require("uuid");
const empPersonal = require("../models/empPersonal");
Helper.generateUUID = () => {
  const id = uuidv4();

  console.log("Generated UUID:", id);
  return id;
};
Helper.adjustLeaveRecords = (leaveBalanceArr, leaveRecordsArr) => {
  leaveBalanceArr.forEach((balance) => {
    const allowed = Number(balance.remainingLeaves ?? 0);

    // Find matching leave records for same employee + leaveType (only approved leaves)
    const matchingRecords = leaveRecordsArr.filter(
      (rec) =>
        rec.employeeId === balance.employeeId &&
        rec.leaveTypeId === balance.leaveTypeId &&
        rec.status === "approved"
    );

    // Total applied leave days
    const appliedLeaveDays = matchingRecords.reduce(
      (total, rec) => total + Number(rec.days || 0),
      0
    );

    if (appliedLeaveDays > allowed) {
      // Sort by fromDate (oldest first)
      const sorted = [...matchingRecords].sort(
        (a, b) => new Date(a.fromDate) - new Date(b.fromDate)
      );

      let used = 0;
      for (const rec of sorted) {
        const recDays = Number(rec.days || 0);
        if (used + recDays <= allowed) {
          rec.leavestatus = "approved"; // within balance
          used += recDays;
        } else {
          rec.leavestatus = "unpaid"; // exceed balance
        }
      }
    } else {
      // All within balance
      matchingRecords.forEach((rec) => {
        rec.leavestatus = "approved";
      });
    }
  });

  return leaveRecordsArr; // updated array
};

// Helper.adjustLeaveRecords = (leaveBalanceArr, leaveRecordsArr) => {
//   leaveBalanceArr.forEach((balance) => {
//     const allowed = balance.remainingLeaves ?? 0;

//     // Find matching leave records for same employee + leaveType (only approved leaves matter)
//     const matchingRecords = leaveRecordsArr.filter(
//       (rec) =>
//         rec.employeeId == balance.employeeId &&
//         rec.leaveTypeId == balance.leaveTypeId &&
//         rec.status == 'approved'
//     );
//     const appliedLeaveLength = matchingRecords.reduce((total, record) => {
//   return total + Number(record.days);   // convert string to number
// }, 0);
//     if (appliedLeaveLength > allowed) {
//       // Sort by fromDate (oldest first)
//       const sorted = [...matchingRecords].sort(
//         (a, b) => new Date(a.fromDate) - new Date(b.fromDate)
//       );

//       // Allowed ones
//       //  remain approved, the rest become unpaid
//       sorted.slice(allowed).forEach((rec) => {
//         rec.leavestatus = "unpaid"; //  mark extra ones as unpaid
//       });
//     } else {
//       //  Enough balance, keep them approved (or add your own logic here)
//       matchingRecords.forEach((rec) => {
//         rec.leavestatus = "approved"; // optional if you want to reset status
//       });
//     }
//   });

//   return leaveRecordsArr; // updated array
// };
// Helper.getIpAddress = (req) => {
//   return (
//     req.headers["x-forwarded-for"]?.split(",")[0] ||
//     req.socket?.remoteAddress ||
//     null
//   );
// };

Helper.getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1"; // Fallback in case no network is found
};

Helper.sendSMS = async (mobile, otp, templateId) => {
  const msg = `Dear User, OTP for your request is ${otp}, OTP is valid for 5 minute.Quaere`;
  const encodedMessage = encodeURIComponent(msg);

  const url=`http://sms.quaeretech.com/submitsms.jsp?user=QuaereE&key=df87c28c39XX&mobile=${mobile}&message=${encodedMessage}&senderid=QUAERE&accusage=1&entityid=1101596760000028822&tempid=${templateId}`
 
  try { 
    const response = await axios.get(url, {
      headers: {
        Cookie: "JSESSIONID=1A15A5E676AF3873C49C0426F6EF319C",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error sending SMS:", error.message);
    return null;
  }
};

Helper.excelDateToJSDate = (serial) => {
  if (!serial) return null;
  const utc_days = Math.floor(serial - 25569); // Excel base date offset
  const utc_value = utc_days * 86400; // seconds
  const date_info = new Date(utc_value * 1000);
  const fractional_day = serial % 1;
  if (fractional_day > 0) {
    const total_seconds = Math.floor(86400 * fractional_day);
    date_info.setUTCHours(Math.floor(total_seconds / 3600));
    date_info.setUTCMinutes(Math.floor((total_seconds % 3600) / 60));
    date_info.setUTCSeconds(total_seconds % 60);
  }
  return date_info;
};

Helper.calculateAttendanceSummary = (
  finalResult,
  shiftArray,
  AttendanceSettings,
  finalWorkingDays
) => {

  let totalWorkingHours = 0;
  let workingDays = 0;
  let onTimeArrivals = 0;
  let lateDays = 0;
  let earlyOutDays = 0;
  let absentDays = 0;

  const attendanceData = finalResult?.[0]?.data || [];

  attendanceData.forEach((day) => {
    const shift = shiftArray.find(
      (s) => s.day_of_week?.toLowerCase() === day.day?.toLowerCase()
    );

    const hasCheckIn = day.checkIn && day.checkIn !== "00:00";
    const hasCheckOut = day.checkOut && day.checkOut !== "00:00";

    // ---------- PRESENT ----------
    if (hasCheckIn || hasCheckOut) {
      workingDays++;

      const shiftStart = shift?.startTime
        ? new Date(`1970-01-01T${shift.startTime}`)
        : null;

      const shiftEnd = shift?.endTime
        ? new Date(`1970-01-01T${shift.endTime}`)
        : null;

      const checkIn = day.checkIn
        ? new Date(`1970-01-01T${day.checkIn}`)
        : null;

      const checkOut = day.checkOut
        ? new Date(`1970-01-01T${day.checkOut}`)
        : null;

      // ---- Calculate worked hours safely ----
      let workedHours = 0;

      if (checkIn instanceof Date && !isNaN(checkIn) &&
          checkOut instanceof Date && !isNaN(checkOut)) {
        workedHours = (checkOut - checkIn) / (1000 * 60 * 60);
        if (isNaN(workedHours)) workedHours = 0;
      }

      totalWorkingHours += workedHours;

      // ----- Late Check-In -----
      const graceMs = (AttendanceSettings?.graceMinutes || 0) * 60 * 1000;

      if (shiftStart && checkIn && !isNaN(shiftStart) && !isNaN(checkIn)) {
        if (checkIn - shiftStart > graceMs) lateDays++;
      }

      // ----- Early Check-Out -----
      if (shiftEnd && checkOut && !isNaN(shiftEnd) && !isNaN(checkOut)) {
        if (checkOut < shiftEnd) earlyOutDays++;
      }

      if (day.status?.toLowerCase().includes("on time")) {
        onTimeArrivals++;
      }
    } else {
      // ---------- ABSENT ----------
      if (!shift?.is_week_off) {
        absentDays++;
      }
    }
  });

  // ---------- SAFE AVERAGES ----------
  const averageWorkingHours =
    workingDays > 0
      ? Number(totalWorkingHours / workingDays).toFixed(2)
      : "0.00";

  const totalHours = Number(totalWorkingHours).toFixed(2);

  const onTimePercent =
    workingDays > 0
      ? ((onTimeArrivals / workingDays) * 100).toFixed(2)
      : "0.00";

  return {
    averageWorkingHours,
    totalWorkingHours: totalHours,
    onTimePercentage: `${onTimePercent}%`,
    lateDays,
    earlyOutDays,
    presentDays: workingDays,
    absentDays,
    workingDays: finalWorkingDays,
  };
};



// Helper.calculateAttendanceSummary = (finalResult, shiftArray, AttendanceSettings,finalworkingDays) => {
//   let totalWorkingHours = 0;
//   let workingDays = 0;
//   let onTimeArrivals = 0;
//   let lateDays = 0;
//   let earlyOutDays = 0;
//   let absentDays = 0;

//   const attendanceData = finalResult[0]?.data || [];

//   attendanceData.forEach((day) => {
//     const shift = shiftArray.find((s) => s.day_of_week == day.day);


//     if (shift?.is_week_off) return;

//     const hasCheckIn = !!day.checkIn && day.checkIn !== "00:00";
//     const hasCheckOut = !!day.checkOut && day.checkOut !== "00:00";

//     if (hasCheckIn && hasCheckOut) {
//       const shiftStart = new Date(`1970-01-01T${shift?.startTime}`);
//       const shiftEnd = new Date(`1970-01-01T${shift?.endTime}`);
//       const checkIn = new Date(`1970-01-01T${day?.checkIn}`);
//       const checkOut = new Date(`1970-01-01T${day?.checkOut}`);

//       const workedHours = (checkOut - checkIn) / (1000 * 60 * 60);
//       totalWorkingHours += workedHours;
//       workingDays++;

//       // Late check-in logic (beyond grace minutes)
//       const graceMs = AttendanceSettings?.graceMinutes
//         ? AttendanceSettings.graceMinutes * 60 * 1000
//         : 0;
//       if (checkIn - shiftStart > graceMs) {
//         lateDays++;
//       }

//       // Early check-out logic
//       if (checkOut < shiftEnd) {
//         earlyOutDays++;
//       }


//       if (day.status?.toLowerCase().includes("on time")) {
//         onTimeArrivals++;
//       }
//     } else if (hasCheckIn && !hasCheckOut) {
    
//       earlyOutDays++;
//       workingDays++;
//     } else {
   
//       absentDays++;
//     }
//   });


//   const averageWorkingHours = workingDays > 0 ? (totalWorkingHours / workingDays).toFixed(2) : 0;
//   const totalHours = totalWorkingHours.toFixed(2);
//   const onTimePercent = workingDays > 0 ? ((onTimeArrivals / workingDays) * 100).toFixed(2) : "0.00";

//   return {
//     averageWorkingHours,
//     totalWorkingHours: totalHours,
//     onTimePercentage: `${onTimePercent}%`,
//     lateDays,
//     earlyOutDays,
//     presentDays: workingDays,
//     absentDays,
//     workingDays:finalworkingDays
//   };
// };


Helper.getWorkingholidays = (year, month, weekOffDays = [], holidayData = []) => {
  const daysInMonth = new Date(year, month , 0).getDate();
  let working = 0;

  // Convert holidays to YYYY-MM-DD format for reliable comparison
  const holidaySet = new Set(
    holidayData.map(h => new Date(h.date).toISOString().split('T')[0])
  );

  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d);
    const formattedDate = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();

    const isWeekOff = weekOffDays.includes(dayOfWeek);
    const isHoliday = holidaySet.has(formattedDate);

    if (!isWeekOff && !isHoliday) working++;
  }

  return working;
};



  Helper.convertNumberToWords = (amount) =>{
    if (amount === 0) return 'zero';
    const a = [
      '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const numToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numToWords(n % 100) : '');
      if (n < 100000) return numToWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + numToWords(n % 1000) : '');
      if (n < 10000000) return numToWords(Math.floor(n / 100000)) + ' lakh' + (n % 100000 ? ' ' + numToWords(n % 100000) : '');
      return numToWords(Math.floor(n / 10000000)) + ' crore' + (n % 10000000 ? ' ' + numToWords(n % 10000000) : '');
    };
    return numToWords(Math.floor(amount));
  }

  Helper.getAllSubordinates =async (directorId,branchId, tenantId) =>{
  let result = [];

  // Find direct employees under this person
  const directReports = await empPersonal.findAll({
    where: { reportingPersonId: directorId, branchId,tenantId, status: "active" },
    attributes: ["id"],
    raw: true,
  });

  for (const emp of directReports) {
    result.push(emp.id);

    // Recursive: get employees under this employee (Team Leader case)
    const subReports = await Helper.getAllSubordinates(emp.id,branchId, tenantId);
    result = result.concat(subReports);
  }

  return result;
}
// Helper.getAllSubordinates =async (directorId,branchId, tenantId) =>{
//   let result = [];

//   // Find direct employees under this person
//   const directReports = await empPersonal.findAll({
//     where: { reportingPersonId: directorId, branchId,tenantId, status: "active" },
//     attributes: ["id"],
//     raw: true,
//   });

//   for (const emp of directReports) {
//     result.push(emp.id);

//     // Recursive: get employees under this employee (Team Leader case)
//     const subReports = await Helper.getAllSubordinates(emp.id, tenantId);
//     result = result.concat(subReports);
//   }

//   return result;
// }

Helper.getWorkingDays = (year, month)=> {
  const totalDays = new Date(year, month, 0).getDate(); // month: 1-12
  let workingDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day); // JS months: 0-11
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }
  return workingDays;
}

Helper.sendNotification = async (deviceToken,title,message) => {
  const payload = {
    token: deviceToken,
    notification: {
      title: title,
      body: message,
    },
  };
  try {
    await admin.messaging().send(payload);
    console.log("Push notification sent successfully");
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}
// Helper.sendNotification = async (deviceToken,title,message) => {
//   const payload = {
//     token: deviceToken,
//     notification: {
//       title: title,
//       body: message,
//     },
//   };
//   try {
//     const response = await admin.messaging().send(payload);
//     console.log("Push notification sent successfully",response);
//   } catch (error) {
//     console.error("Error sending push notification:", error);
//   }
// }

module.exports = Helper;
