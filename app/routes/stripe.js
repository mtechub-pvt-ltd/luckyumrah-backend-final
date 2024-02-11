module.exports = app => {

const stripe = require("../controllers/stripe");
const upload = require("../middlewares/FolderImagesMulter")

let router = require("express").Router();

router.post("/initiatePayment", stripe.initiatePayment);
router.post("/checkout", stripe.checkout);
router.post("/paymentSheet", stripe.paymentSheet);
router.post("/Pay", stripe.Pay);
router.post("/view_all", stripe.viewAll);
router.put("/update",stripe.update);
router.delete("/delete" , stripe.delete)
router.post("/search", stripe.search);


app.use("/stripe", router);
};
