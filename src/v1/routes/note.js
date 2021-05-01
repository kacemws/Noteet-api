//middleware
const express = require("express");
const Joi = require("joi");
const router = express.Router();
const auth = require("../middleware/auth");

//utils
const noteModule = require("../logic/note");

////////////////////schemas

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The note's ID.
 *           example: 0
 *         note:
 *           type: string
 *           description: The content of the note.
 *           example: my first note using noteet
 *         color:
 *           type: string
 *           description: The code for the color used.
 *           example: "#e6ee96"
 *         createdAt:
 *           type: Date
 *           description: The day where the user created this note.
 *           example: 2020-10-10
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NewNote:
 *       type: object
 *       properties:
 *         value:
 *           type: string
 *           description: The content of the note.
 *           example: my first note using noteet
 *         color:
 *           type: string
 *           description: The code for the color used.
 *           example: "#e6ee96"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateNote:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The id of the note.
 *           example: 11de5dzefzefzef
 *         value:
 *           type: string
 *           description: The content of the note.
 *           example: my updated note
 *         color:
 *           type: string
 *           description: The code for the color used.
 *           example: "#e6ee96"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DeletedNote:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The id of the note.
 *           example: 11de5dzefzefzef
 */

////////////////////operations

/**
 * @swagger
 * paths :
 *   /v1/notes/:
 *     get:
 *       summary: Retrieve user's notes.
 *       description: Retrieve the notes of the user who sent the request via the provided token.
 *       responses:
 *         200:
 *           description: An Array of notes.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Note'
 *     post:
 *       summary: Create a note.
 *       description: Creates a note for the user who sent the request.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewNote'
 *         responses:
 *           201:
 *             description: The id of the new note.
 *             content:
 *               application/json:
 *                 schema:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: the id of the newly created note
 *     put:
 *       summary: Update a note.
 *       description: update an existing note.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateNote'
 *         responses:
 *           200:
 *             description: The id of the updated note.
 *             content:
 *               application/json:
 *                 schema:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: the id of the updated note
 *     delete:
 *       summary: Delete a note.
 *       description: delete an existing note.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeletedNote'
 *         responses:
 *           200:
 *             description: The id of the deleted note.
 *             content:
 *               application/json:
 *                 schema:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: the id of the deleted note
 */

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

router.get("/:id", auth, async (req, res) => {
  try {
    const owner = req.user?.id;
    const { id } = req?.params;

    const note = await noteModule.find(id, owner);

    if (!note) {
      throw {
        statusCode: 400,
        body: "note not found",
      };
    }

    res.status(200).json({
      ...note["_doc"],
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

    res.status(201).json({
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

router.put("/:id", auth, async (req, res) => {
  try {
    if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
      throw {
        statusCode: 400,
        body: "Empty request!",
      };
    }

    const { id } = req?.params;
    const { error } = verifyExistingNote({ ...req.body, id });

    if (error) {
      throw {
        statusCode: 400,
        body: error.details[0].message,
      };
    }

    const { value, color } = req.body;
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

router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req?.params;

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
    id: Joi.string().required(),
    value: Joi.string().required(),
    color: Joi.string().required(),
  });

  return schema.validate(data);
}

function verifyId(data) {
  const schema = Joi.object({
    id: Joi.string().required(),
  });

  return schema.validate(data);
}

module.exports = router;
