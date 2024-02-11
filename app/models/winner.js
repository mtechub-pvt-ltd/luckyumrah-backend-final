const { sql } = require("../config/db.config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fastcsv = require("fast-csv");
const fs = require("fs");

const winner = function (winner) {
  this.id = winner.id;
  this.participant_id = winner.participant_id;
  this.session_id = winner.session_id;
};
winner.create = async (req, res) => {
  try {
    const { participant_id, session_id } = req.body;
    const winnerData = await sql.query(
      `select * from "winner" where participant_id = $1 AND session_id=$2`,
      [participant_id, session_id]
    );
    if (winnerData.rows.length > 0) {
      return res.status(401).json({
        statusCode: 401,
        message: `Winner Already Present for this session!`,
        status: false,
      });
    }
    const userExist = await sql.query(
      `select * from "participant" where id = $1 AND session_id=$2`,
      [participant_id, session_id]
    );
    if (userExist.rows.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: `Participant does not exist`,
        status: false,
      });
    }
    if (participant_id === null || participant_id === "") {
      return res.json({
        message: "Please Enter participant id",
        status: false,
      });
    }

    console.log(participant_id);

    const query = `INSERT INTO "winner"
				 (participant_id, session_id  )
                            VALUES ( $1,$2 ) RETURNING * `;
    const foundResult = await sql.query(query, [participant_id, session_id]);
    if (foundResult.rows.length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Winner Added Successfully!",
        status: true,
        result: foundResult.rows,
      });
    } else {
      res.json({
        message: "Try Again",
        status: false,
        err,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: "Error",
      status: false,
      err,
    });
  }
};

winner.viewSpecific = async (req, res) => {
  try {
    sql.query(
      `SELECT "winner".*, "participant".*,session.*
	  FROM "winner"
	  JOIN participant ON participant.id = winner.participant_id
	  JOIN session ON session.id = winner.session_id
	  WHERE "winner"."session_id" = $1;
	  `,
      [req.body.session_id],
      (err, result) => {
        if (err) {
          console.log(err);
          res.json({
            message: "Try Again",
            status: false,
            err,
          });
        } else {
          res.status(200).json({
            statusCode: 200,
            status: true,
            result: result.rows,
          });
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server error",
      status: false,
      error: error.stack,
    });
  }
};

winner.viewSpecific_Between_Dates = async (req, res) => {
  console.log(req.body.start_date);
  console.log(req.body.end_date);

  sql.query(
    `SELECT "winner".*, "participant_form".*
	FROM "winner"
	JOIN "participant_form" ON "participant_form".participant_form_id = "winner".participant_form_id
	WHERE "winner".announcement_date::date >= $1 AND "winner".announcement_date::date <= $2`,
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
          message: "Specific Winner Details",
          status: true,
          result: result.rows,
        });
      }
    }
  );
};

winner.viewAll = async (req, res) => {
  const data = await sql.query(`SELECT COUNT(*) AS count FROM "winner"`);
  let limit = req.body.limit;
  let page = req.body.page;
  let result;
  if (!page || !limit) {
    result =
      await sql.query(  `SELECT "winner".*, "participant".*,session.*
      FROM "winner"
      JOIN participant ON participant.id = winner.participant_id
      JOIN session ON session.id = winner.session_id`);
  }
  if (page && limit) {
    limit = parseInt(limit);
    let offset = (parseInt(page) - 1) * limit;
    result = await sql.query(
      `SELECT "winner".*, "participant".*,session.*
      FROM "winner"
      JOIN participant ON participant.id = winner.participant_id
      JOIN session ON session.id = winner.session_id
      LIMIT $1 OFFSET $2;
      `,
      [limit, offset]
    );
  }
  console.log(result);
  if (result.rows) {
    res.json({
      message: "All Winner Details",
      status: true,
      count: data.rows[0].count,
      result: result.rows,
    });
  } else {
    res.json({
      message: "could not fetch",
      status: false,
    });
  }
};

winner.update = async (req, res) => {
  if (req.body.winner_id === "") {
    res.json({
      message: "winner id is required",
      status: false,
    });
  } else {
    console.log(req.body.winner_id);
    const winnerData = await sql.query(
      `select * from "winner" where winner_id = $1`,
      [req.body.winner_id]
    );

    if (winnerData.rowCount > 0) {
      const oldparticipant_form_id = winnerData.rows[0].participant_form_id;
      const oldannouncement_date = winnerData.rows[0].announcement_date;

      let { winner_id, participant_form_id, announcement_date } = req.body;
      if (participant_form_id === undefined || participant_form_id === "") {
        participant_form_id = oldparticipant_form_id;
      }
      if (announcement_date === undefined || announcement_date === "") {
        announcement_date = oldannouncement_date;
      }
      sql.query(
        `update "winner" SET participant_form_id  = $1,
			announcement_date = $2
			  WHERE winner_id = $3;`,
        [participant_form_id, announcement_date, winner_id],
        async (err, result) => {
          if (err) {
            console.log(err);
            res.json({
              message: "Try Again",
              status: false,
              err,
            });
          } else {
            if (result.rowCount === 1) {
              const data = await sql.query(
                `select * from "winner" where winner_id = $1`,
                [req.body.winner_id]
              );
              res.json({
                message: "winner Updated Successfully!",
                status: true,
                result: data.rows,
              });
            } else if (result.rowCount === 0) {
              res.json({
                message: "Not Found",
                status: false,
              });
            }
          }
        }
      );
    } else {
      res.json({
        message: "Not Found",
        status: false,
      });
    }
  }
};

winner.delete = async (req, res) => {
  const data = await sql.query(`select * from "winner" where winner_id = $1`, [
    req.body.winner_id,
  ]);
  if (data.rows.length === 1) {
    sql.query(
      `DELETE FROM "winner" where winner_id = $1`,
      [req.body.winner_id],
      (err, result) => {
        if (err) {
          res.json({
            message: "Try Again",
            status: false,
            err,
          });
        } else {
          res.json({
            message: "winner Deleted Successfully!",
            status: true,
            result: data.rows,
          });
        }
      }
    );
  } else {
    res.json({
      message: "Not Found",
      status: false,
    });
  }
};

module.exports = winner;
