module.exports = app => {

const winner = require("../controllers/winner");

let router = require("express").Router();

router.post("/add", winner.create);



router.get("/view_all_winners", winner.viewSpecific);
router.get("/view_all", winner.viewAll);
router.put("/update", winner.update);
router.post("/viewSpecific_Between_Dates",winner.viewSpecific_Between_Dates);
router.delete("/delete" , winner.delete)
router.post("/search", winner.search);
router.post("/viewAll_winnerType_id", winner.viewAll_winnerType_id);
router.delete("/deleteAll" , winner.deleteAll)


app.use("/winner", router);
};
