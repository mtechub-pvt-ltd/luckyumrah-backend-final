const { sql } = require("../config/db.config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const admin = function (admin) {
	this.email = admin.email;
	this.password = admin.password;
};
admin.create = async (req, res) => {

	if (!req.body.email || req.body.email === '') {
		res.json({
			message: "Please Enter your Email",
			status: false,
		});
	} else if (!req.body.password) {
		res.json({
			message: "Please Enter Password",
			status: false,
		});
	} else {
		const check = (`SELECT * FROM "admin" WHERE email = $1`);
		const checkResult = await sql.query(check, [req.body.email]);
		if (checkResult.rows.length > 0) {
			res.json({
				message: "admin Already Exists",
				status: false,
			});
		} else if (checkResult.rows.length === 0) {
			let photo;
			if (req.file) {
				const { path } = req.file;
				photo = path
			}
			const salt = await bcrypt.genSalt(10);
			let hashpassword = await bcrypt.hash(req.body.password, salt);
			const { email, user_name } = req.body;
			const query = `INSERT INTO "admin" (admin_id,email,password, user_name ,image , created_at ,updated_at )
                            VALUES (DEFAULT, $1, $2, $3,  $4, 'NOW()' ,'NOW()' ) RETURNING * `;
			const foundResult = await sql.query(query,
				[email, hashpassword, user_name, photo]);
			if (foundResult.rows.length > 0) {
				const token = jwt.sign({ id: foundResult.rows[0].id }, 'IhTRsIsUwMyHAmKsA', {
					expiresIn: "7d",
				});
				res.json({
					message: "admin Added Successfully!",
					status: true,
					result: foundResult.rows,
					token: token
				});
			} else {
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			}
		};
	}

}

admin.login = async function (req, res) {
	sql.query(`SELECT * FROM "admin" WHERE email = $1`, [req.body.email], (err, result) => {
		if (err) {
			console.log(err);
			res.json({
				message: "Try Again",
				status: false,
				err
			});
		}
		else {
			if (result.rows.length === 0) {
				res.json({
					message: "admin Not Found",
					status: false,
				});
			} else {
				if (bcrypt.compareSync(req.body.password, result.rows[0].password)) {



					const token = jwt.sign({ id: result.rows[0].id }, 'IhTRsIsUwMyHAmKsA', {
						expiresIn: "7d",
					});
					res.json({
						message: "Login Successful",
						status: true,
						result: result.rows,
						token
					});
				} else {
					res.json({
						message: "Invalid Password",
						status: false,
					});
				}
			}
		}
	});
}


admin.GetAdminByID = (req, res) => {
	sql.query(`SELECT * FROM "admin" WHERE  admin_id = $1`, [req.body.admin_id], (err, result) => {
		if (err) {
			console.log(err);
			res.json({
				message: "Try Again",
				status: false,
				err
			});
		} else {
			res.json({
				message: "admin Details",
				status: true,
				result: result.rows
			});
		}
	});
}

admin.resetPassword = async function (req, res) {
	const { email, currentPassword, newPassword } = req.body;
	sql.query(`SELECT * FROM "admin" WHERE email = $1`, [email], async (err, results) => {
		if (err) {
			console.log(err);
			res.json({
				message: "Try Again",
				status: false,
				err
			});
		}
		else {
			if (results.rows.length === 0) {
				res.json({
					message: "admin Not Found",
					status: false,
				});
			} else {
				console.log(results.rows);
				if (bcrypt.compareSync(currentPassword, results.rows[0].password)) {
					const salt = await bcrypt.genSalt(10);
					const hashPassword = await bcrypt.hash(newPassword, salt);
					sql.query(`UPDATE "admin" SET password = $1 WHERE email = $2`, [hashPassword, email], (err, result) => {
						if (err) {
							console.log(err);
							res.json({
								message: "Try Again",
								status: false,
								err
							});
						}
						else {
							res.json({
								message: "Password Changed Successfully",
								status: true,
								results: results.rows
							});
						}
					})
				}
				else {
					res.json({
						message: "Incorrect Password",
						status: false,
					});
				}

			}
		}
	});

}

admin.newPassword = async (req, res) => {
	try {
		const email = req.body.email;
		const found_email_query = `SELECT * FROM otp WHERE email = $1 AND status = $2`
		const result = await sql.query(found_email_query, [email, 'verified'])
		if (result.rowCount > 0) {
			const found_email = 'SELECT * FROM admin WHERE email = $1'
			const foundResult = await sql.query(found_email, [email])
			if (foundResult.rowCount > 0) {
				const salt = await bcrypt.genSalt(10);
				let hashpassword = await bcrypt.hash(req.body.password, salt);
				let query = `UPDATE "admin" SET password = $1  WHERE email = $2 RETURNING*`
				let values = [hashpassword, email]
				let updateResult = await sql.query(query, values);
				updateResult = updateResult.rows[0];
				console.log(result.rows);
				sql.query(`DELETE FROM otp WHERE id = $1;`, [result.rows[0].id], (err, result) => { });
				res.json({
					message: "Password changed",
					status: true,
					result: updateResult
				})

			} else {
				const found_email = 'SELECT * FROM "users" WHERE email = $1'
				const foundResult = await sql.query(found_email, [req.body.email])
				if (foundResult.rowCount > 0) {
					const salt = await bcrypt.genSalt(10);
					let hashpassword = await bcrypt.hash(req.body.password, salt);
					let query = `UPDATE "users" SET password = $1  WHERE email = $2 RETURNING*`
					let values = [hashpassword, req.body.email]
					let updateResult = await sql.query(query, values);
					updateResult = updateResult.rows[0];
					sql.query(`DELETE FROM otp WHERE id = $1;`, [result.rows[0].id], (err, result) => { });
					res.json({
						message: "Password changed",
						status: true,
						result: updateResult
					})
				} else {
					res.json({
						message: "Not Found! Try Again",
						status: true,
						result: updateResult
					})
				}
			}
		}
		else {
			res.json({
				message: "Not Found Any OTP, First Verify Email then Change Password",
				status: false
			})
		}
	}
	catch (err) {
		console.log(err)
		res.status(500).json({
			message: `Internal server error occurred`,
			success: false,
		});
	}
}


admin.updateProfile = async (req, res) => {
	if (req.body.admin_id === '') {
		res.json({
			message: "admin_id is required",
			status: false,
		});
	} else {
		const userData = await sql.query(`select * from "admin" where admin_id = $1`, [req.body.admin_id]);
		if (userData.rowCount === 1) {
			const oldName = userData.rows[0].user_name;
			const oldEmail = userData.rows[0].email;
			let old_image = userData.rows[0].image;
			let photo = old_image;
			if (req.file) {
				const { path } = req.file;
				photo = path
			}

			let { admin_id, email, user_name } = req.body;
			if (user_name === undefined || user_name === '') {
				user_name = oldName;
			}
			if (email === undefined || email === '') {
				email = oldEmail;
			}
			sql.query(`UPDATE "admin" SET  email = $1,  user_name = $2, image = $3  WHERE admin_id = $4;`,
				[email, user_name, photo, admin_id], async (err, result) => {
					if (err) {
						console.log(err);
						res.json({
							message: "Try Again",
							status: false,
							err
						});
					} else {
						if (result.rowCount === 1) {
							const data = await sql.query(`select * from "admin" where admin_id = $1`, [req.body.admin_id]);
							res.json({
								message: "admin Updated Successfully!",
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
				});
		} else {
			res.json({
				message: "Not Found",
				status: false,
			});
		}
	}
}

admin.delete = async (req, res) => {
	const data = await sql.query(`select * from "admin" where admin_id = $1`, [req.body.admin_id]);
	if (data.rows.length === 1) {
		sql.query(`DELETE FROM "admin" WHERE admin_id = $1;`, [req.body.admin_id], (err, result) => {
			if (err) {
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				res.json({
					message: "admin Deleted Successfully!",
					status: true,
					result: data.rows,

				});
			}
		});
	} else {
		res.json({
			message: "Not Found",
			status: false,
		});
	}
}


admin.getYears = (req, res) => {
	sql.query(`SELECT EXTRACT(year FROM  created_at) AS year
	FROM "participant_form" 
	GROUP BY EXTRACT(year FROM created_at )
	ORDER BY year `, (err, result) => {
		if (err) {
			console.log(err);
			res.json({
				message: "Try Again",
				status: false,
				err
			});
		} else {
			res.json({
				message: "user table's years",
				status: true,
				result: result.rows,
			});
		}
	});

}
admin.getAllUsers_MonthWise_count = (req, res) => {
	sql.query(`
	SELECT months.month, COUNT(u.created_at) AS count
FROM (
    SELECT generate_series(1, 12) AS month
) AS months
LEFT JOIN "participant_form" AS u ON EXTRACT(month FROM u.created_at) = months.month
                      AND EXTRACT(year FROM u.created_at) = $1
GROUP BY months.month
ORDER BY months.month;
	`, [req.body.year], (err, result) => {
		if (err) {
			console.log(err);
			res.json({
				message: "Try Again",
				status: false,
				err
			});
		} else {
			console.log(result.rows);
			res.json({
				message: "Monthly added participant",
				status: true,
				result: result.rows,
			});
		}
	});

}
module.exports = admin;