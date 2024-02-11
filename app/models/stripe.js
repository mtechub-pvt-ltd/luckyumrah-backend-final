
const { sql } = require("../config/db.config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
(process.env.STRIPE_SECRET);
// const stripeId = Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

const stripe_payment = function (stripe_payment) {
	this.stripe_payment_name = stripe_payment.stripe_payment_name;
};
const stripe = require("stripe")(
	"sk_test_51M52HOKKbeaPyhBWSxoMiWjBQMUGvH7fzRmkHcSCJ22TNtTR0VQCfb2o948WxvXk6n11Eza3jYCQqy8RgOhjSbfh00owY7MmQh"
);


stripe_payment.paymentSheet = async (req, res) => {
	try {
		const { amount, currency, participant_form_id } = req.body;
		// Use an existing Customer ID if this is a returning customer.
		const customer = await stripe.customers.create();
		const ephemeralKey = await stripe.ephemeralKeys.create(
			{ customer: customer.id },
			{ apiVersion: "2022-11-15" }
		);
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount,
			currency: currency,
			customer: customer.id,
			payment_method_types: ["card"],
			// automatic_payment_methods: {
			//   enabled: true,
			// },
			//   subscription_data: {
			//     trial_period_days: 3,
			//   },
			//   payment_method_collection: "if_required",
		});
		const query = `INSERT INTO "stripe"
		(stripe_id,participant_form_id,status,amount ,created_at ,updated_at )
				   VALUES (DEFAULT, $1,$2,$3, 'NOW()','NOW()' ) RETURNING * `;
		const foundResult = await sql.query(query,
			[participant_form_id, 'pending', amount]);
		res.json({
			status: true,
			error: false,
			paymentIntent: paymentIntent.client_secret,
			ephemeralKey: ephemeralKey.secret,
			customer: customer.id,
			result: foundResult.rows
		});
	} catch (error) {
		console.log(error)
		res.json({
			error: true,
			message: error,
		});
	}
}


stripe_payment.viewSpecific = (req, res) => {
	sql.query(`SELECT * FROM "stripe_payment" WHERE ( stripe_payment_id = $1)`, [req.body.stripe_payment_id], (err, result) => {
		if (err) {
			console.log(err);
			res.json({
				message: "Try Again",
				status: false,
				err
			});
		} else {
			res.json({
				message: "stripe_payment Details",
				status: true,
				result: result.rows
			});
		}
	});
}

stripe_payment.viewAll = async (req, res) => {
	const data = await sql.query(`SELECT COUNT(*) AS count FROM "stripe"`);
	let limit = req.body.limit;
	let page = req.body.page;
	let result;
	if (!page || !limit) {
		result = await sql.query(`SELECT * FROM "stripe" ORDER by created_at DESC `);
	}
	if (page && limit) {
		limit = parseInt(limit);
		let offset = (parseInt(page) - 1) * limit
		result = await sql.query(`SELECT * FROM "stripe" ORDER by created_at DESC 
		LIMIT $1 OFFSET $2 ` , [limit, offset]);
	}
	if (result.rows) {
		res.json({
			message: "All Categories ",
			status: true,
			count: data.rows[0].count,
			result: result.rows,
		});
	} else {
		res.json({
			message: "could not fetch",
			status: false
		})
	}
}

stripe_payment.update = async (req, res) => {
	if (req.body.stripe_id === '') {
		res.json({
			message: "Stripe Id is required",
			status: false,
		});
	} else {
		const stripe_paymentData = await sql.query(`select * from "stripe" where stripe_id = $1`, [req.body.stripe_id]);
		if (stripe_paymentData.rowCount > 0) {
			const oldstatus = stripe_paymentData.rows[0].status;

			let { status, stripe_id } = req.body;

			if (status === undefined || status === '') {
				status = oldstatus;
			}

			sql.query(`UPDATE "stripe" SET status =  $1  WHERE stripe_id = $2;`,
				[status, stripe_id], async (err, result) => {
					if (err) {
						console.log(err);
						res.json({
							message: "Try Again",
							status: false,
							err
						});
					} else {
						if (result.rowCount > 0) {
							const data = await sql.query(`select * from "stripe" where stripe_id = $1`, [req.body.stripe_id]);
							res.json({
								message: "stripe payment Updated Successfully!",
								status: true,
								result: data.rows,
							});
						} else {
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

stripe_payment.delete = async (req, res) => {
	const data = await sql.query(`select * from "stripe" where  stripe_id = $1`, [req.body.stripe_id]);
	if (data.rows.length === 1) {
		sql.query(`DELETE FROM "stripe" WHERE stripe_id = $1;`, [req.body.stripe_id], (err, result) => {
			if (err) {
				res.json({
					message: "Try Again",
					status: false,
					err
				});
			} else {
				res.json({
					message: "stripe payment Deleted Successfully!",
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
module.exports = stripe_payment;