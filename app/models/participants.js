const { sql } = require("../config/db.config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fastcsv = require("fast-csv");
const fs = require("fs");
const { utcToZonedTime, zonedTimeToUtc } = require("date-fns-tz");
const { parse, isValid, format } = require("date-fns");
const nodemailer = require("nodemailer");
const emailThankYouBody = require("../utils/emailThankYouBody");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ihteshamm112@gmail.com",
    pass: "fzcnqvtxfzxarjxr",
  },
});

const participant_form = function (participant_form) {
  this.participant_form_id = participant_form.participant_form_id;
  this.name = participant_form.name;
  this.email = participant_form.email;
  this.passport = participant_form.passport;
  this.referral_code = participant_form.referral_code;
};
participant_form.create = async (req, res) => {  
  try {
    const { session_id,name, email, phone_no } = req.body;
    if (!req.body.email || req.body.email === "") {
      res.json({
        message: "Please Enter Email",
        status: false,
      });
    } else {
      const data = await sql.query(
        `select * from "participant" where email = $1 AND session_id=$2`,
        [req.body.email,session_id]
      );
      if (data.rows.length) {
		return res.status(401).json({
			statusCode: 401,
			message: "Participants already add in this session!",
			status: false,
		  });
	  }
  

        const query = `INSERT INTO "participant"
				 (session_id,name, email ,phone_no  )
                            VALUES ($1, $2, $3,$4) RETURNING * `;
        const foundResult = await sql.query(query, [session_id,name, email, phone_no]);

        // sendThankYouEmail(req, res, foundResult)
        res
          .status(201)
          .json({
            statusCode: 201,
            message: "Participant add successfully",
            participant: foundResult.rows[0],
          });
      } 
    
  } catch (error) {
	res.status(500).json({
		statusCode: 500,
		message: "Internal Server error",
		status: false,
		error:error.stack
	});
};
}
participant_form.viewAll = async (req, res) => {
	try {
		const data = await sql.query(
			`SELECT COUNT(*) AS count FROM "participant"`
		  );
		  let limit = req.body.limit;
		  let page = req.body.page;
		  let result;
		  if (!page || !limit) {
			result = await sql.query(
			  `SELECT * FROM "participant" ORDER BY "created_at" DESC`
			);
		  }
		  if (page && limit) {
			limit = parseInt(limit);
			let offset = (parseInt(page) - 1) * limit;
			result = await sql.query(
			  `SELECT * FROM "participant" ORDER BY "created_at" DESC
				LIMIT $1 OFFSET $2 `,
			  [limit, offset]
			);
		  }
			res.json({
			  message: "All Participant Details",
			  status: true,
			  count: data.rows[0].count,
			  result: result.rows,
			});
		 
	} catch (error) {
		res.status(500).json({
			statusCode: 500,
			message: "Internal Server error",
			status: false,
			error:error.stack
		});
	}
	
  };
  participant_form.delete = async (req, res) => {
	try {
		const data = await sql.query(
			`select * from "participant" where id = $1 AND session_id=$2`,
			[req.body.participant_id,req.body.session_id]
		  );
		  if(data.rows.length===0){
			return res.status(404).json({
                statusCode: 404,
                message: "Participant not found ",
                status: false,
		  })
		}
			sql.query(
			  `DELETE FROM "participant" where id = $1 AND session_id=$2`,
			  [req.body.participant_form_id,req.body.session_id],
			  (err, result) => {
				if (err) {
				  res.json({
					message: "Try Again",
					status: false,
					err,
				  });
				} else {
				  res.status(200).json({
					statusCode:200,
					message: "Participant Deleted Successfully!",
					status: true,
					result: data.rows,
				  });
				}
			  }
			);
		  
	} catch (error) {
		res.status(500).json({
			statusCode: 500,
			message: "Internal Server error",
			status: false,
			error:error.stack
		});
	}
  
};
participant_form.deleteMultiple = async (req, res) => {
	try {
	  const { session_id, participant_ids } = req.body;
      console.log(req.body);
	  // Check if any of the participant IDs are not found
	  const invalidParticipantIds = [];
	  const validParticipants = [];
	  for (const participantId of participant_ids) {
		const data = await sql.query(
		  `SELECT * FROM "participant" WHERE id = $1 AND session_id = $2`,
		  [participantId, session_id]
		);
  
		if (data.rows.length === 0) {
		  invalidParticipantIds.push(participantId);
		} else {
		  validParticipants.push(data.rows[0]);
		}
	  }
  
	  if (invalidParticipantIds.length > 0) {
		return res.status(404).json({
		  statusCode: 404,
		  message: "Some participants not found",
		  status: false,
		  invalidParticipantIds,
		});
	  }
  
	  // Delete the valid participants
	  const deletedParticipants = [];
	  for (const participantId of participant_ids) {
		await sql.query(
		  `DELETE FROM "participant" WHERE id = $1 AND session_id = $2`,
		  [participantId, session_id]
		);
		deletedParticipants.push(participantId);
	  }
  
	  res.status(200).json({
		statusCode: 200,
		message: "Participants Deleted Successfully!",
		status: true,
		// deletedParticipantIds: deletedParticipants,
		deletedParticipants: validParticipants,
	  });
	} catch (error) {
	  res.status(500).json({
		statusCode: 500,
		message: "Internal Server error",
		status: false,
		error: error.stack,
	  });
	}
  };
participant_form.viewSpecific = async (req, res) => {
	try {
		sql.query(
			`SELECT * FROM "participant" WHERE
						id = $1`,
			[req.body.participant_id],
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
					statusCode:200,
				  message: "Specific Participant Details",
				  status: true,
				  result: result.rows,
				});
			  }
			}
		  );
	} catch (error) {
		return res.status(500).json({
			statusCode: 500,
			message: "Internal Server error ",
			status: false,
			error:error.stack
	})
 
};
}
participant_form.viewCount_participant = async (req, res) => {
  const data = await sql.query(
    `SELECT COUNT(*) AS count FROM "participant_form"`
  );

  if (data.rows) {
    res.json({
      message: "All Participant Details",
      status: true,
      count: data.rows[0].count,
    });
  } else {
    res.json({
      message: "could not fetch",
      status: false,
    });
  }
};
participant_form.viewCount_winners = async (req, res) => {
  const data = await sql.query(`SELECT COUNT(*) AS count FROM "winner"`);

  if (data.rows) {
    res.json({
      message: "All Participant Details",
      status: true,
      count: data.rows[0].count,
    });
  } else {
    res.json({
      message: "could not fetch",
      status: false,
    });
  }
};

participant_form.viewAllBetweenDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Validate and parse the start and end dates
    const parsedStartDate = parse(startDate, "MM-dd-yyyy", new Date());
    const parsedEndDate = parse(endDate, "MM-dd-yyyy", new Date());
    if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Format the parsed dates into PostgreSQL-compatible format (without time component)
    const startDateFormatted = format(parsedStartDate, "yyyy-MM-dd");
    const endDateFormatted = format(parsedEndDate, "yyyy-MM-dd");

    // Construct the SQL query using date_trunc
    const query = `
		  SELECT * FROM participant_form
		  WHERE date_trunc('day', created_at) >= $1
		  AND date_trunc('day', created_at) <= $2
		`;

    // Execute the query with the parameters
    const { rows } = await sql.query(query, [
      startDateFormatted,
      endDateFormatted,
    ]);

    res.status(200).json({ status: true, data: rows });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

participant_form.update = async (req, res) => {
  if (req.body.participant_form_id === "") {
    res.json({
      message: "participant_form_id is required",
      status: false,
    });
  } else {
    const participant_formData = await sql.query(
      `select * from "participant_form" where participant_form_id = $1`,
      [req.body.participant_form_id]
    );

    console.log(participant_formData.rows);
    if (participant_formData.rowCount > 0) {
      const oldemail = participant_formData.rows[0].email;
      const oldpassport = participant_formData.rows[0].passport;
      const oldreferral_code = participant_formData.rows[0].referral_code;

      let { referral_code, participant_form_id, email, passport, name } =
        req.body;

      if (email === undefined || email === "") {
        email = oldemail;
      }
      if (referral_code === undefined || referral_code === "") {
        referral_code = oldreferral_code;
      }

      if (passport === undefined || passport === "") {
        passport = oldpassport;
      }
      sql.query(
        `update "participant_form" SET email = $1,
			 passport = $2, referral_code = $3 , name = $4 WHERE participant_form_id = $5 `,
        [email, passport, referral_code, name, participant_form_id],
        async (err, result) => {
          if (err) {
            console.log(err);
            res.json({
              message: "Try Again",
              status: false,
              err,
            });
          } else {
            if (result.rowCount > 0) {
              const data = await sql.query(
                `select * from "participant_form" where participant_form_id = $1`,
                [req.body.participant_form_id]
              );
              res.json({
                message: "Participant Updated Successfully!",
                status: true,
                result: data.rows,
              });
            } else if (result.rowCount === 0) {
              res.json({
                message: "Not Found to update",
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


  
const sendThankYouEmail = async (req, res, result) => {
  try {
    const Data = await sql.query(`select * from "announcement"`);
    const { email } = req.body;
    let sendEmailResponse;
    if (Data.rowCount > 0) {
      let announcement_date = Data.rows[0].announcement_date;
      console.log(announcement_date);
      const link = "https://mtechub.org/mail/?_task=mail&_mbox=INBOX";
      sendEmailResponse = await transporter.sendMail({
        from: "formFilly@Lucky_umrah.com",
        to: email,
        subject: "Form Filled Successfully",
        html: emailThankYouBody(
          "Lucky Umrah",
          "#746C70",
          `${announcement_date}`,
          link
        ),
      });
    } else {
      sendEmailResponse = await transporter.sendMail({
        from: "formFilly@Lucky_umrah.com",
        to: email,
        subject: "Form Filled Successfully",
        html: emailThankYouBody("Lucky Umrah", "#746C70", ""),
      });
    }

    if (sendEmailResponse.accepted.length > 0) {
      res.json({
        message: "Form Filled Successfully!",
        status: true,
        result: result.rows[0],
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: `Internal server error occurred`,
      success: false,
    });
  }
};

module.exports = participant_form;
