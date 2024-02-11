module.exports = app => {
  const admin = require("../controllers/admin");

  var router = require("express").Router();
  const upload = require("../middlewares/FolderImagesMulter")


  router.post("/sign_in", admin.signIn);
  router.post("/sign_up", upload.single('image'), admin.signUp);
  router.put("/resetPassword", admin.resetPassword);
  router.post("/getYears", admin.getYears);
  router.post("/getAllUsers_MonthWise_count", admin.getAllUsers_MonthWise_count);

  // router.put("/verify_OTP_change_password", admin.verifyOTPChangePassword);
  router.put("/update_profile", upload.single('image'), admin.updateProfile);

  // router.post("/verifyEmail", admin.verifyEmail);
  // router.post("/verifyOTP", admin.verifyOTP)
  router.post("/newPassword", admin.newPassword)
  router.post("/google_sign_in", admin.GooglesignIn);
  router.post("/get_admin_by_id", admin.GetAdminByID);
  router.delete("/delete", admin.delete);


  app.use('/admin', router);
};