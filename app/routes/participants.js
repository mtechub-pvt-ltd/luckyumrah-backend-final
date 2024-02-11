module.exports = app => {

const participants = require("../controllers/participants");
const upload = require("../middlewares/FolderImagesMulter")

let router = require("express").Router();

router.post("/add_participant", participants.create);
router.post("/view_all", participants.viewAll);
router.delete("/delete" , participants.delete)
router.delete("/deleteMultipleParticipants" , participants.deleteMultiple)
router.get("/view_specific", participants.viewSpecific);


// router.post("/upload_image", participants.uploadImage);
// router.post("/search", participants.search);
// router.post("/viewCount_participant", participants.viewCount_participant);
// router.post("/viewCount_winners", participants.viewCount_winners);


// router.post("/view_all_betwwen_dates", participants.viewAllBetweenDates);
// router.put("/update", participants.update);

// router.post("/search", participants.search);
// router.post("/view_all_User", participants.viewAll_User);


app.use("/participants", router);
};
