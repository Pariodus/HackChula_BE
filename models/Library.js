const mongoose = require("mongoose");

const LibrarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 charaters"],
    },
    status: {
      type: String,
      enum: ["open", "close"],
      default: "open",
    },
    opentime: {
      type: String,
      required: true,
      default: "08:00:00",
    },
    closetime: {
      type: String,
      required: true,
      default: "19:00:00",
    },
    telephone: {
      type: String,
      required: [true, "Please add a telephone"],
    },
    picture: {
      type: String,
      required: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

LibrarySchema.pre('deleteOne', {document: true, query: false}, async function(next){
  console.log(`Bookings being removed from provider ${this._id}`);
  await this.model('Reservation').deleteMany({library: this._id});
  next();
});


LibrarySchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "library",
  justOne: false,
});

module.exports = mongoose.model("Library", LibrarySchema);
