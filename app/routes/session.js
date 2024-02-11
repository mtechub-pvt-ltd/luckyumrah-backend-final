module.exports = app => {

    const session = require("../controllers/session");
    
    let router = require("express").Router();
    
    router.post("/create_session", session.create);
    router.put("/update_session", session.update);
    router.delete("/delete_session" , session.delete)
    router.get("/view_specific_session/:session_id", session.viewSpecific);
    router.get("/view_all_session", session.viewAll);

    router.post("/view_specific_on_announcement_date",session.view_specific_on_announcement_date);
    router.get("/getActiveSession",session.getActiveSession);
    router.put("/update_session_status", session.updateStatus);

    // router.post("/viewSpecific_Between_Dates",session.viewSpecific_Between_Dates);

    // router.post("/search", session.search);
    // router.post("/viewAll_sessionType_id", session.viewAll_sessionType_id);
    // router.delete("/deleteAll" , session.deleteAll)
    
    
    app.use("/session", router);
    };
    