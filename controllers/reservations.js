const Room = require("../models/Room");
const Reservation = require("../models/Reservation");
const Library = require("../models/Library");
const mongoose = require('mongoose');
const { stack } = require("../routes/reservations");
const User = require("../models/User");


//desc    Get All reservations
//route   Get /api/reservations
//access  Public
exports.getReservations = async (req, res, next) => {
  let query;
  // General users can see only their appointment
  if (req.user.role !== "admin") {
    query = Reservation.find({ user: req.user.id }).populate({
      path: "room",
      select: "name province tel",
    });
  } else {
    // If you are an admin, you can see all
    if (req.params.roomId) {
      console.log(req.params.roomId);
      query = Reservation.find({
        room: req.params.roomId,
      }).populate({
        path: "room",
        select: "name province tel",
      });
    } else {
      query = Reservation.find().populate({
        path: "room",
        select: "name province tel",
      });
    }
  }
  try {
    const reservations = await query;
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "Cannot find Appointment",
    });
  }
};

//desc    Get single reservation
//route   Get /api/reservations/:id
//access  Public
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate({
      path: "room",
      select: "name description tel",
    });
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "Cannot riri find Reservation",
    });
  }
};


//desc    Add reservation/
//route   POST /api/rooms/:roomId/reservations
//access  Private
exports.addReservation = async (req, res, next) => {

  try {

    req.body.room = req.params.roomId;

    const room = await Room.findById(req.params.roomId);

    //เช็คว่ามีห้องนี้จริงไหม
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `No room with the id of ${req.params.roomId}`,
      });
    }

    //เช็คเวลาstartมากกว่าend
    const { start, end } = req.body;
    if ( start >= end ) {
      return res.status(400).json({ 
        error: 'End date must be after start date' 
      });
    }

    //เช็คว่าเวลาต้องอยู่ในช่วงเปิดปิดของห้องสมุด
    const library = await Library.findById('6613a791af2d442911f0be7c');
    const OpenTimeLibrary = library?.opentime || "09:00:00";
    const CloseTimeLibrary = library?.endtime || "18:00:00"; 
    // console.log(OpenTimeLibrary)
    // console.log(CloseTimeLibrary)

    if ( start < OpenTimeLibrary ) {
      return res.status(400).json({ 
        error: 'start mai dai ja' 
      });
    }
    else if ( end > CloseTimeLibrary ) {
      return res.status(400).json({ 
        error: 'end mai dai ja' 
      });
    }

    const { apptDate , studentId2, studentId3, studentId4  } = req.body;

    // const CheckStudentID2 = await Reservation.findById({ studentId2: studentId2._id});
    // console.log(CheckStudentID2)

    //เช็คว่าคนๆนี้ bookingแล้วเวลาทับกับที่เคยจองไหม
    const { studentId1 } = req.body;
    const existstudentID1 = await Reservation.countDocuments({studentId1});
    console.log(existstudentID1)
    if ( existstudentID1 > 0 ) {
      const studentIDreservationtotal = await Reservation.find({ studentId1 }).sort({ start: 1 });
      const { start, end } = req.body;
      for(const rs of studentIDreservationtotal) {
        if( rs.start >= start ) {
          if( rs.start <= start) {
            return res.status(400).json({ error: 'You jong time ne law1' });
          }
          else {
            if( end <= rs.start ) {
              console.log('passpasspass')
            }
            else {
              return res.status(400).json({ error: 'You jong time ne law2 endtime maidai' });
            }
          }
          break;
        }
      }
    } 

      const reservation = {
        apptDate,
        room,
        studentId1,
        studentId2,
        studentId3,
        studentId4,
        start,
        end,
      };

    const existingRoomReservations = await Reservation.countDocuments({
      room: room._id,
    });

    //ห้องนี้ยังไม่เคยถูกจอง -> orderแรกของห้องนั้น
    if( existingRoomReservations == 0 ) { 
      
      const NewReservation = await Reservation.create(reservation);
      res.status(200).json({ 
        message: 'Reservation created successfully', 
        data: NewReservation 
      });  
    }

    //ห้องนี้เคยถูกจอง -> เช็คว่าorderเวลาทับซ้อนกับคนที่เคยจองไหม
    else { 

      // const { apptDate, studentId1, studentId2, studentId3, studentId4, start, end } = req.body;

      const roomNow = await Room.findById(req.params.roomId);
      const ReservationthisRoomtotal = await Reservation.find({ room: roomNow._id }).sort({ start: 1 });
      
      // console.log(roomNow)
      // console.log(roomNow._id)

      for(const rs of ReservationthisRoomtotal) { //หาstartที่น้อยที่สุดที่มากกว่าstart Order ต่างๆ และ endต้องน้อยกว่าstart Orderถัดไป
        console.log(start)
        console.log(rs.start)

        if( rs.start > start ) {
          if ( rs.start <= start ) {
            return res.status(400).json({ error: 'Me kon jong law' });
          }
          else if ( end >  rs.start ) {
            return res.status(400).json({ error: 'endtime maidai' });
          }
          else {
        
            const NewReservation = await Reservation.create(reservation);
        
            res.status(200).json({ 
              message: 'Reservation created successfully', 
              data: NewReservation 
            });  
          }
        }
      }
      const NewReservation = await Reservation.create(reservation); //กรณีorderหลังสุดตอนนี้ในreservationแต่ละห้อง
      res.status(200).json({ 
        message: 'Reservation final created successfully', 
        data: NewReservation 
      });  

    }
    
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "Cannot eieie create Reservation",
    });
  }
};


//desc    Update reservation
//route   PUT /api/reservations/:Id
//access  Private
exports.updateReservation = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    let library = await Library.findById(reservation.library);

    //const library = await Library.findById(req.params.libraryId);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation with the id of ${req.params.id}`,
      });
    }

    //Make sure user is the reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this reservation`,
      });
    }

    if (
      req.body.start.localeCompare(room.opentime) < 0 ||
      req.body.end.localeCompare(room.closetime) > 0
    ) {
      return res.status(400).json({
        success: false,
        message: `Please update reservation within ${room.opentime} and ${room.closetime}`,
      });
    }

    if (req.body.start.localeCompare(req.body.end) > 0) {
      return res.status(400).json({
        success: false,
        message: `Please update valid reservation`,
      });
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "Cannot update Reservation",
    });
  }
};

//desc    Delete reservation
//route   DELETE /api/reservations/:Id
//access  Private
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation with the id of ${req.params.id}`,
      });
    }

    // Make sure user is the reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this reservation`,
      });
    }

    await reservation.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "Cannot delete Reservation",
    });
  }
};
