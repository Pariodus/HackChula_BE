const express = require("express");
const {
  getLibrarys,
  getLibrary,
  createLibrary,
  updateLibrary,
} = require("../controllers/librarys");

//Include other resource routers
const reservationRouter = require("./reservations");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

//Re-route into other resource routers
router.use("/:libraryId/reservations/", reservationRouter);

router
  .route("/")
  .get(getLibrarys)
  .post(protect, authorize("admin"), createLibrary);
router
  .route("/:id")
  .get(getLibrary)
  .put(protect, authorize("admin"), updateLibrary);

module.exports = router;
