import mongoose, { Schema } from "mongoose";

const itemTotalSchema = new Schema({
  id: {
    type: String,
    enum: ["cpn", "cpd", "cps", "cpt", "cpm", "cpa", "trh", "trmo", "trhn", "trd", "trl", "trml", "soc", "sovq"],
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    enum: ["hot", "cold"],
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
});

const finishedOrder = new Schema({
  order_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: false,
  },
  items_total: {
    type: [itemTotalSchema],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  posted: {
    type: Boolean,
    required: true,
  },
  completion_time: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["cancelled", "completed"],
    required: true,
  },
});

export = mongoose.model("finished-orders", finishedOrder);