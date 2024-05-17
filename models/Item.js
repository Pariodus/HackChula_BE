const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Please add an id"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      unique: false,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    total: {
      type: String,
      required: [true, "Please add number of all items"],
    },
    borrow: {
      type: String,
      required: [true, "Please add number of items borrowed"],
    },
    floor: {
      type: Number,
      enum: [3, 4],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ItemSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Reservations being removed from item ${this._id}`);
    await this.model("Reservation").deleteMany({ item: this._id });
    next();
  }
);

ItemSchema.virtual("items", {
  ref: "Item",
  localField: "_id",
  foreignField: "item",
  justOne: false,
});

module.exports = mongoose.model("Item", ItemSchema);
