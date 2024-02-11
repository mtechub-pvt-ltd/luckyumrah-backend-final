const userModel=require("../models/userModel")
const axios = require('axios');


async function pushNotification(message){

const FCM_RESOURCE = 'https://fcm.googleapis.com/fcm/send';
const FCM_SERVER_KEY ="AAAAhrFHMok:APA91bGihT5e7gSjT28na4Z9n5M02Lv2N41PL6GR7B2ssldBzD6VFKeilSo86jHjmUPD0v63RNuFIh10GWFlfXjKI1x9VMLLEai2J-z0uj5hFFstpLYReI8u063SALDF9ynwVgiXgGsU";
var array=[];



const result = await userModel.find({});
 result.forEach(element => {
        if(element){
            if(element.device_token){
                if(element.device_token!=="0"){
                    array.push(element.device_token);

                }
            }
        }
    });

     
    var data = JSON.stringify({
        registration_ids: array,
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

module.exports= pushNotification
