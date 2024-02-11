const { sql } = require("../config/db.config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fastcsv = require("fast-csv");
const fs = require("fs");
const schedule = require("node-schedule");
const { dateFormat, convertDateFormat } = require("../utils/dateUtils");
const moment = require("moment");
const lucky_draw = function (lucky_draw) {
  this.lucky_draw_id = lucky_draw.lucky_draw_id;
  this.start_time = lucky_draw.start_time;
  this.announcement_date = lucky_draw.announcement_date;
  this.duration = lucky_draw.duration;
};
lucky_draw.create = async (req, res) => {
  try {
    const { start_date, announcement_date, lucky_draw_time } = req.body;
    const lucky_drawData = await sql.query(
      `SELECT COUNT(*)
        FROM session
        WHERE
          (
            (start_date <= $1 AND $1 <= announcement_date) OR
            (start_date <= $2 AND $2 <= announcement_date)
          )
          OR
          (
            ($1 <= start_date AND start_date <= $2) OR
            ($1 <= announcement_date AND announcement_date <= $2)
          );
        
        `,
      [start_date, announcement_date]
    );
    if (lucky_drawData.rows[0].count > 0) {
      res.json({
        message: `lucky draw Duration Already Present for given Date!`,
        status: false,
      });
    } else {
      if (
        start_date === null ||
        start_date === "" ||
        announcement_date === null ||
        announcement_date === "" ||
        lucky_draw_time === null ||
        lucky_draw_time === ""
      ) {
        res.json({
          message: "Please Enter all required fields",
          status: false,
        });
      } else {
        const query = `INSERT INTO "session"
				 (start_date, announcement_date, lucky_draw_time )
                 VALUES ($1 AT TIME ZONE 'UTC', $2 AT TIME ZONE 'UTC', $3) RETURNING * `;
        const foundResult = await sql.query(query, [
          dateFormat(start_date),
          dateFormat(announcement_date),
          lucky_draw_time,
        ]);
        if (foundResult.rows.length > 0) {
          res.status(201).json({
            message: "Session Added Successfully!",
            statusCode: 201,
            result: {
              ...foundResult.rows[0],
              start_date: moment(foundResult.rows[0].start_date).format(
                "MM-DD-YYYY"
              ),
              announcement_date: moment(
                foundResult.rows[0].announcement_date
              ).format("MM-DD-YYYY"),
              lucky_draw_time: foundResult.rows[0].lucky_draw_time,
            },
          });
        } else {
          res.status(400).json({
            statusCode: 400,
            message: "Try Again",
            status: false,
            err,
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      message: "Error",
      status: false,
      err,
    });
  }
};

lucky_draw.view_specific_on_announcement_date = async (req, res) => {
  try {
    // Retrieve data from the database
    const result = await sql.query(
      `SELECT
      "session".id AS session_id,
      TO_CHAR(session.start_date, 'MM-DD-YYYY') AS start_date,
      TO_CHAR(session.announcement_date, 'MM-DD-YYYY') AS announcement_date,
      "session".lucky_draw_time,
      "session".status AS session_status,
      (
        SELECT json_agg(participants)
        FROM (
          SELECT
            "participant".id AS participant_id,
            "participant".name AS participant_name,
            "participant".email AS participant_email,
            "participant".phone_no AS participant_phone_no
          FROM "participant"
          WHERE "participant".session_id = "session".id
        ) participants
      ) AS participants,
      (
        SELECT json_agg(winners)
        FROM (
          SELECT
            "winner".id AS winner_id,
            "winner".participant_id,
            "participant".name AS winner_name,
            "participant".email AS winner_email,
            "participant".phone_no AS winner_phone_no
          FROM "winner"
          JOIN "participant" ON "winner".participant_id = "participant".id
          WHERE "winner".session_id = "session".id
        ) winners
      ) AS winners
    FROM "session"
    WHERE "session".announcement_date = $1;`,
      [req.body.announcement_date]
    );
    if (result.rowCount > 0) {
      res.status(200).json({
        statusCode: 200,
        result: result.rows,
      });
    } else {
      res.status(200).json({
        message: "No Lucky draw on Given Date!",
        statusCode: 200,
        result: result.rows,
      });
    }
    // Release the database connection
  } catch (err) {
    console.error("Error fetching data from the database", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
lucky_draw.getActiveSession = async (req, res) => {
  try {
    // Retrieve data from the database
    const result = await sql.query(
      `SELECT
        "session".id AS session_id,
        TO_CHAR(session.start_date, 'MM-DD-YYYY') AS start_date,
        TO_CHAR(session.announcement_date, 'MM-DD-YYYY') AS announcement_date,
        "session".lucky_draw_time,
        "session".status AS session_status,
        (
          SELECT json_agg(participants)
          FROM (
            SELECT
              "participant".id AS participant_id,
              "participant".name AS participant_name,
              "participant".email AS participant_email,
              "participant".phone_no AS participant_phone_no
            FROM "participant"
            WHERE "participant".session_id = "session".id
          ) participants
        ) AS participants,
        (
          SELECT json_agg(winners)
          FROM (
            SELECT
              "winner".id AS winner_id,
              "winner".participant_id,
              "participant".name AS winner_name,
              "participant".email AS winner_email,
              "participant".phone_no AS winner_phone_no
            FROM "winner"
            JOIN "participant" ON "winner".participant_id = "participant".id
            WHERE "winner".session_id = "session".id
          ) winners
        ) AS winners
      FROM "session"
      WHERE "session".status = $1;`,
      ["active"]
    );
    if (result.rowCount > 0) {

      res.status(200).json({
        statusCode: 200,
        result: result.rows,
      });
    } else {
      res.json({
        message: "No active session on Given Date!",
        statusCode: 200,
        result: result.rows,
      });
    }
    // Release the database connection
  } catch (err) {
    console.error("Error fetching data from the database", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
lucky_draw.viewSpecific = async (req, res) => {
  try {
    // Retrieve data from the database
    const result = await sql.query(
      `SELECT
      "session".id AS session_id,
      TO_CHAR(session.start_date, 'MM-DD-YYYY') AS start_date,
      TO_CHAR(session.announcement_date, 'MM-DD-YYYY') AS announcement_date,
      "session".lucky_draw_time,
      "session".status AS session_status,
      (
        SELECT json_agg(participants)
        FROM (
          SELECT
            "participant".id AS participant_id,
            "participant".name AS participant_name,
            "participant".email AS participant_email,
            "participant".phone_no AS participant_phone_no
          FROM "participant"
          WHERE "participant".session_id = "session".id
        ) participants
      ) AS participants,
      (
        SELECT json_agg(winners)
        FROM (
          SELECT
            "winner".id AS winner_id,
            "winner".participant_id,
            "participant".name AS winner_name,
            "participant".email AS winner_email,
            "participant".phone_no AS winner_phone_no
          FROM "winner"
          JOIN "participant" ON "winner".participant_id = "participant".id
          WHERE "winner".session_id = "session".id
        ) winners
      ) AS winners
    FROM "session"
    WHERE "session".id = $1;`,
      [req.params.session_id]
    );
    if (result.rows.length > 0) {
      const data = result.rows[0];

      res.status(200).json({
        statusCode: 200,
        result: result.rows[0],
      });
      //   }
    } else {
      res.status(404).json({
        message: "No Session found",
        status: false,
        statusCode: 404,
      });
    }
    // Release the database connection
  } catch (err) {
    console.error("Error fetching data from the database", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

lucky_draw.viewSpecific_Between_Dates = async (req, res) => {
  console.log(req.body.start_date);
  console.log(req.body.end_date);

  sql.query(
    `SELECT "lucky_draw".*, "participant_form".*
	FROM "lucky_draw"
	JOIN "participant_form" ON "participant_form".start_time = "lucky_draw".start_time
	WHERE "lucky_draw".announcement_date::date >= $1 AND "lucky_draw".announcement_date::date <= $2`,
    [req.body.start_date, req.body.end_date],
    (err, result) => {
      if (err) {
        console.log(err);
        res.json({
          message: "Try Again",
          status: false,
          err,
        });
      } else {
        res.json({
          message: "Specific lucky_draw Details",
          status: true,
          result: result.rows,
        });
      }
    }
  );
};

lucky_draw.viewAll = async (req, res) => {
  try {
    const data = await sql.query(`SELECT COUNT(*) AS count FROM "session"`);
    let limit = req.body.limit;
    let page = req.body.page;
    let result;
    if (!page || !limit) {
      result = await sql.query(`
    SELECT
    "session".id AS session_id,
    TO_CHAR(session.start_date, 'MM-DD-YYYY') AS start_date,
    TO_CHAR(session.announcement_date, 'MM-DD-YYYY') AS announcement_date,
    "session".lucky_draw_time,
    "session".status AS session_status,
    (
      SELECT json_agg(participants)
      FROM (
        SELECT
          "participant".id AS participant_id,
          "participant".name AS participant_name,
          "participant".email AS participant_email,
          "participant".phone_no AS participant_phone_no
        FROM "participant"
        WHERE "participant".session_id = "session".id
      ) participants
    ) AS participants,
    (
      SELECT json_agg(winners)
      FROM (
        SELECT
          "winner".id AS winner_id,
          "winner".participant_id,
          "participant".name AS winner_name,
          "participant".email AS winner_email,
          "participant".phone_no AS winner_phone_no
        FROM "winner"
        JOIN "participant" ON "winner".participant_id = "participant".id
        WHERE "winner".session_id = "session".id
      ) winners
    ) AS winners
  FROM "session"
  ;`);
    }
    if (page && limit) {
      limit = parseInt(limit);
      let offset = (parseInt(page) - 1) * limit;
      result = await sql.query(
        `SELECT
      "session".id AS session_id,
      TO_CHAR(session.start_date, 'MM-DD-YYYY') AS start_date,
      TO_CHAR(session.announcement_date, 'MM-DD-YYYY') AS announcement_date,
      "session".lucky_draw_time,
      "session".status AS session_status,
      (
        SELECT json_agg(participants)
        FROM (
          SELECT
            "participant".id AS participant_id,
            "participant".name AS participant_name,
            "participant".email AS participant_email,
            "participant".phone_no AS participant_phone_no
          FROM "participant"
          WHERE "participant".session_id = "session".id
        ) participants
      ) AS participants,
      (
        SELECT json_agg(winners)
        FROM (
          SELECT
            "winner".id AS winner_id,
            "winner".participant_id,
            "participant".name AS winner_name,
            "participant".email AS winner_email,
            "participant".phone_no AS winner_phone_no
          FROM "winner"
          JOIN "participant" ON "winner".participant_id = "participant".id
          WHERE "winner".session_id = "session".id
        ) winners
      ) AS winners
    FROM "session"

		LIMIT $1 OFFSET $2;`,
        [limit, offset]
      );
    }
    res.json({
      count: data.rows[0].count,
      result: result.rows,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        statusCode: 500,
        message: "Internal Server error",
        error: error.stack,
      });
  }
};

lucky_draw.update = async (req, res) => {
  let { session_id, start_date, announcement_date, lucky_draw_time } = req.body;
  if (session_id === "") {
    res.json({
      message: "session id is required",
      status: false,
    });
  } else {
    const lucky_drawData = await sql.query(
      `select * from "session" where id = $1`,
      [session_id]
    );

    if (lucky_drawData.rows.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "Session not found ",
        status: false,
      });
    }
    const checkDates = await sql.query(
      `SELECT COUNT(*)
        FROM session
        WHERE 
        (
            (
                (start_date <= $1 AND $1 <= announcement_date) OR
                (start_date <= $2 AND $2 <= announcement_date)
            )
            OR
            (
                ($1 <= start_date AND start_date <= $2) OR
                ($1 <= announcement_date AND announcement_date <= $2)
            )
        )
        AND 
        id NOT IN ($3);
          `,
      [start_date, announcement_date, session_id]
    );
    if (checkDates.rows[0].count > 0) {
      return res.json({
        message: `lucky draw Duration Already Present for given Date!`,
        status: false,
      });
    }
    const result = await sql.query(
      `update "session" SET start_date  = $1,
			announcement_date = $2 , lucky_draw_time = $3
			  WHERE id = $4 RETURNING *`,
      [
        dateFormat(start_date),
        dateFormat(announcement_date),
        lucky_draw_time,
        session_id,
      ]
    );
    console.log(result);
    if (result.rowCount === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "Try Again",
        status: false,
      });
    }
    res.status(200).json({
      message: "Session updated Successfully!",
      statusCode: 200,
      result: {
        ...result.rows[0],
        start_date: moment(result.rows[0].start_date).format("MM-DD-YYYY"),
        announcement_date: moment(result.rows[0].announcement_date).format(
          "MM-DD-YYYY"
        ),
        lucky_draw_time: result.rows[0].lucky_draw_time,
      },
    });
  }
};

lucky_draw.delete = async (req, res) => {
  const data = await sql.query(`select * from "session" where id = $1`, [
    req.body.session_id,
  ]);
  if (data.rows.length === 1) {
    sql.query(
      `DELETE FROM "session" where id = $1`,
      [req.body.session_id],
      (err, result) => {
        if (err) {
          res.status(400).json({
            statusCode: 400,
            message: "Try Again",
            status: false,
            err,
          });
        } else {
          res.status(200).json({
            message: "Session Deleted Successfully!",
            status: true,
            statusCode: 200,
            result: data.rows[0],
          });
        }
      }
    );
  } else {
    return res.status(404).json({
      statusCode: 404,
      message: "Session not found ",
      status: false,
    });
  }
};
lucky_draw.updateStatus = async (req, res) => {
  try {
    let { session_id, status } = req.body;
  if (session_id === "") {
    res.status(400).json({
      message: "session id is required",
      statusCode:400
    });
  } else {
    const lucky_drawData = await sql.query(
      `SELECT * FROM "session" WHERE id = $1`,
      [session_id]
    );

    if (lucky_drawData.rows.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "Session not found ",
        statusCode:404
      });
    }
   
    const result = await sql.query(
      `update "session" SET status = $1
			  WHERE id = $2 RETURNING *`,
      [
        status,
        session_id,
      ]
    );
    if (result.rowCount === 0) {
      return res.status(400).json({
        statusCode: 400,
        message: "Try Again",
        statusCode:200
      });
    }
    const getquery = await sql.query(
      `SELECT
      "session".id AS session_id,
      TO_CHAR(session.start_date, 'MM-DD-YYYY') AS start_date,
      TO_CHAR(session.announcement_date, 'MM-DD-YYYY') AS announcement_date,
      "session".lucky_draw_time,
      "session".status AS session_status,
      (
        SELECT json_agg(participants)
        FROM (
          SELECT
            "participant".id AS participant_id,
            "participant".name AS participant_name,
            "participant".email AS participant_email,
            "participant".phone_no AS participant_phone_no
          FROM "participant"
          WHERE "participant".session_id = "session".id
        ) participants
      ) AS participants,
      (
        SELECT json_agg(winners)
        FROM (
          SELECT
            "winner".id AS winner_id,
            "winner".participant_id,
            "participant".name AS winner_name,
            "participant".email AS winner_email,
            "participant".phone_no AS winner_phone_no
          FROM "winner"
          JOIN "participant" ON "winner".participant_id = "participant".id
          WHERE "winner".session_id = "session".id
        ) winners
      ) AS winners
    FROM "session"
    WHERE "session".id = $1;`,
      [session_id]
    );
    res.status(200).json({
      message: "Session status updated Successfully!",
      statusCode: 200,
      result: getquery.rows[0]
    });
  }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error:error.stack
  });
  }
  
};

module.exports = lucky_draw;
