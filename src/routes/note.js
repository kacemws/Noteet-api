//middleware
const express = require("express");
const Joi = require("joi");
const router = express.Router();
const auth = require("../middleware/auth");

//utils
const noteModule = require("../logic/note");

router.get("/", auth, async (req, res) => {
  try {
    const owner = req.user?.id;
    let notes = await noteModule.get(owner);

    if (notes?.length == 0) {
      throw {
        statusCode: 204,
        body: "No notes",
      };
    }
    // Send 200 - notes
    res.status(200).json({
      notes,
    });
  } catch (err) {
    console.error(err);
    if (err.statusCode) {
      res.status(err.statusCode).json({
        message: err.body,
      });
    }
  }
});

router.post("/", auth, async (req, res) => {
  try {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      throw {
        statusCode: 400,
        body: "Empty request!",
      };
    }
    const owner = req.user?.id;

    const { error } = verifyNote(req.body);
    if (error) {
      throw {
        statusCode: 400,
        body: error.details[0].message,
      };
    }

    const { value, color } = req.body;

    const note = await noteModule.create({
      value,
      owner,
      color,
    });

    console.log(note);

    res.status(200).json({
      message: "created successfuly",
      id: note["_id"],
    });
  } catch (err) {
    console.error(err);
    if (err.statusCode) {
      res.status(err.statusCode).json({
        message: err.body,
      });
    }
  }
});

router.put("/", auth, async (req, res) => {
  try {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      throw {
        statusCode: 400,
        body: "Empty request!",
      };
    }

    const { error } = verifyExistingNote(req.body);
    if (error) {
      throw {
        statusCode: 400,
        body: error.details[0].message,
      };
    }

    const { id, value, color } = req.body;
    const owner = req.user?.id;

    const note = await noteModule.find(id, owner);

    if (!note) {
      throw {
        statusCode: 400,
        body: "note not found",
      };
    }

    await noteModule.update(id, {
      value,
      color,
    });

    res.status(200).json({
      message: "updated successfuly",
      id: note["_id"],
    });
  } catch (err) {
    console.error(err);
    if (err.statusCode) {
      res.status(err.statusCode).json({
        message: err.body,
      });
    }
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      throw {
        statusCode: 400,
        body: "Empty request!",
      };
    }

    const { id } = req.body;

    const { error } = verifyId({
      id,
    });
    if (error) {
      throw {
        statusCode: 400,
        body: error.details[0].message,
      };
    }

    const owner = req.user?.id;

    const note = await noteModule.find(id, owner);

    if (!note) {
      throw {
        statusCode: 400,
        body: "note not found",
      };
    }

    await noteModule.delete(id);

    res.status(200).json({
      message: "deleted successfuly",
      id,
    });
  } catch (err) {
    console.error(err);
    if (err.statusCode) {
      res.status(err.statusCode).json({
        message: err.body,
      });
    }
  }
});

function verifyNote(data) {
  const schema = Joi.object({
    value: Joi.string().required(),
    color: Joi.string().required(),
  });

  return schema.validate(data);
}
function verifyExistingNote(data) {
  const schema = Joi.object({
    id: Joi.string().length(12).required(),
    value: Joi.string().required(),
    color: Joi.string().required(),
  });

  return schema.validate(data);
}

function verifyId(data) {
  const schema = Joi.object({
    id: Joi.string().length(12).required(),
  });

  return schema.validate(data);
}

module.exports = router;
