const admin = require("../models/admin");


// Create and Save a new admin
exports.signUp = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.create( req, res);
};

exports.signIn = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.login( req, res);
};

exports.GetAdminByID = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.GetAdminByID( req, res);
};

exports.updateProfile = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.updateProfile( req, res);
};


exports.resetPassword = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.resetPassword( req, res);
};

exports.GooglesignIn = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.GooglesignIn( req, res);
};

exports.delete = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.delete( req, res);
};
exports.passwordReset = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.resetPassword( req, res);
};
// exports.verifyEmail = (req, res) => {
//   if (!req.body) {
//     res.json({
//       message: "Content can not be empty!",
//       status: false,
//      });
//   }  
//   otp.VerifyEmail( req, res);
// };
exports.getYears = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.getYears( req, res);
};
exports.getAllUsers_MonthWise_count = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.getAllUsers_MonthWise_count( req, res);
};
exports.newPassword = (req, res) => {
  if (!req.body) {
    res.json({
      message: "Content can not be empty!",
      status: false,
     });
  }  
  admin.newPassword( req, res);
};

// exports.verifyOTP = (req, res) => {
//   if (!req.body) {
//     res.json({
//       message: "Content can not be empty!",
//       status: false,
//      });
//   }  
//   otp.verifyOTP( req, res);
// };