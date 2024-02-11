const multer = require('multer');

try{
   var storage=multer.diskStorage({
      destination:function(req,file,cb){
          cb(null,'images_uploads/' )
      },
      filename:function(req,file,cb){
          cb(null ,`Q_Leever_@_${Date.now()}` )
      }
  })
  var upload = multer({storage:storage})
  module.exports=upload
}
catch(err){
    console.log(err);
}