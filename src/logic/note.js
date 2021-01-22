const mongoose = require("mongoose");
const noteSchema = require("../models/noteSchema");
const Note = mongoose.model("note", noteSchema, "notes");

async function createNote(data) {
  const { value, owner, color } = data;

  return new Note({
    value,
    owner,
    color,
    created: Date.now(),
  }).save();
}

async function updateNote(id, data) {
  return await Note.findByIdAndUpdate(id, data, {
    useFindAndModify: false,
  });
}

async function deleteNote(id) {
  return await Note.findByIdAndDelete(id);
}

async function getNotes(owner) {
  return await Note.find({ owner });
}

exports.create = createNote;
exports.update = updateNote;
exports.delete = deleteNote;
exports.get = getNotes;
