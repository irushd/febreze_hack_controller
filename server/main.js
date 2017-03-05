import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

Meteor.startup(() => {
  console.log("Hello World");
  let user_settings_data = {}
  let next_trigger = {}
  let last_timestamps = []
  triggerFebrezeLed(0);
  //run every 5seconds
  function setupSystem()
  {
    // Get the latest json file and trigger the timer to run the behavior accroding to it
    let response = HTTP.get("https://warm-dawn-28511.herokuapp.com/setup", function(error, result){
      if(error){
        console.log("GET latest file failed! error", error);
      }
      if(result){
        user_settings = result.data.triggers
        console.log("User trigger settings: ");
        // console.log(user_settings);

        // get the time for last midnight
        let last_midnight_time = (new Date()).setHours(0,0,0,0);
        console.log("Midnight: " + last_midnight_time);
        let new_timestamps = []
        index = 0
        // foreach trigger
        for (setting of user_settings) {
          console.log(setting);
          //figure out the future time when the it needs to triggered
          let trigger_time = setting.name;
          trigger_time = trigger_time.split(':');
          let hours = trigger_time[0]
          let minutes = trigger_time[1]
          let seconds = trigger_time[2]

          let future_time = (new Date()).setHours(19, 45, 0, 0);
          console.log(future_time);
          let delay_from_now = Number(future_time - Date.now());
          console.log("delay_from_now: " + delay_from_now);
          const MS_IN_5_MINS = 5*60000;
          new_timestamps[index] = setting.timestamp
          if(last_timestamps[index] != new_timestamps[index]) {
            console.log("SHOULD BE TURNED ON NOW");
          // if ((delay_from_now > -5000) && (delay_from_now < 5000)) {
            //start the timer to trigger the febreze command with appropriate arguments
            next_trigger = setting.name;
            triggerFebreze()
            // Meteor.setTimeout(triggerFebreze, delay_from_now);
          // }
          }
          index++;
        }
        last_timestamps = new_timestamps
      }
    });
  }

  function findNextTrigger(){
    console.log("findNextTrigger called");
    return next_trigger;
  }

  function triggerFebreze(){
    let trigger_name = findNextTrigger();
    let smell = smellByTrigger(trigger_name);
    triggerFebrezeLed(smell);
    console.log("Febreze Triggered!");
  }

  function triggerFebrezeLed(color) {
    HTTP.call("PUT", "https://na-hackathon-api.arrayent.io/v3/devices/33554444",
    {
      headers:{
        "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJiYjY4OWFiMC0wMTQ3LTExZTctOTIwNy1iNWMzYjY2M2Y2YTQiLCJlbnZpcm9ubWVudF9pZCI6Ijk0OGUyY2YwLWZkNTItMTFlNi1hZTQ2LTVmYzI0MDQyYTg1MyIsInVzZXJfaWQiOiI5MDAwMDkwIiwic2NvcGVzIjoie30iLCJncmFudF90eXBlIjoiYXV0aG9yaXphdGlvbl9jb2RlIiwiaWF0IjoxNDg4Njc5NjU0LCJleHAiOjE0ODk4ODkyNTR9.QJwjsMbWrOJUZRuPD_BpRGe8z0qjP1SDb15A-FJzcztV8sdyU0IXoqGyrLvemd8hdWMaFzwByQk0wXOaNCFL-Q",
        "Content-Type": "application/json"
      },
      data: [{"DeviceAction": "led_mode="+parseInt(color) }, {"DeviceAction": "led_color=0,11,4,4,4" }]},
      function (error, result) {
        if (error) {
          console.log("Error:" + error);
        } else {
          console.log("result:" + result);
        }
      });

    }

    function smellByTrigger(trigger_name){
      return 1;
    }

    //setup the cron job to refresh the user settings every 5 mins
    Meteor.setInterval(setupSystem, 5*1000);
    setupSystem();
  });
