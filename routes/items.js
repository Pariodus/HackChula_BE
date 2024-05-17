const express = require("express");
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/items");

// Include other resource routers
// const itemRouter = require("./items");

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
// router.use("/:itemId/items/", itemRouter);

router.route("/").get(getItems).post(protect, authorize("admin"), createItem);
router
  .route("/:id")
  .get(getItem)
  .put(protect, authorize("admin"), updateItem)
  .delete(protect, authorize("admin"), deleteItem);

module.exports = router;
