const userModel = require("../models/userModel");
const axios = require('axios');

async function sendNotificationToUser(user_id , message ){
    try{
        const FCM_RESOURCE = 'https://fcm.googleapis.com/fcm/send';
        const FCM_SERVER_KEY ="AAAAhrFHMok:APA91bGihT5e7gSjT28na4Z9n5M02Lv2N41PL6GR7B2ssldBzD6VFKeilSo86jHjmUPD0v63RNuFIh10GWFlfXjKI1x9VMLLEai2J-z0uj5hFFstpLYReI8u063SALDF9ynwVgiXgGsU";
        let deviceToken;
        const result = await userModel.findOne({_id:user_id});
        if(result){
            deviceToken = result.device_token;
        }

        var data = JSON.stringify({
            to: deviceToken,
            collapse_key: 'type_a',
            notification: {
              title:"Notification received",
              body:message
            },
          });
          console.log(data)
          var config = {
            method: 'post',
            url: FCM_RESOURCE,
            headers: {
              Authorization: `key=${FCM_SERVER_KEY}`,
              'Content-Type': 'application/json',
            },
            data: data,
          };
    
          const response = await axios(config);
          console.log(response.data);
          if(response.data.results.length > 0) {
              return true
          }
          else{
            return false;
          }
    }
    catch(err){
        console.log(err);
        return false;
       
    }
}

module.exports= sendNotificationToUser