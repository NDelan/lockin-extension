(()=>{function e(t){return e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e(t)}function t(e,t){var o=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),o.push.apply(o,a)}return o}function o(e){for(var o=1;o<arguments.length;o++){var r=null!=arguments[o]?arguments[o]:{};o%2?t(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):t(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function a(t,o,a){return(o=function(t){var o=function(t){if("object"!=e(t)||!t)return t;var o=t[Symbol.toPrimitive];if(void 0!==o){var a=o.call(t,"string");if("object"!=e(a))return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==e(o)?o:o+""}(o))in t?Object.defineProperty(t,o,{value:a,enumerable:!0,configurable:!0,writable:!0}):t[o]=a,t}var r=!1;function n(){chrome.contentSettings.notifications.set({primaryPattern:"<all_urls>",setting:"block"})}function i(){chrome.contentSettings.notifications.set({primaryPattern:"<all_urls>",setting:"allow"})}function s(){console.log("Ending focus session"),chrome.storage.local.get(["timerState"],(function(e){if(e.timerState){var t=e.timerState.savedType||"POMODORO",o=25;"SHORT_BREAK"===t?o=5:"LONG_BREAK"===t&&(o=15),r=!1,i();var a={savedType:t,savedMinutes:o,savedSeconds:0,savedIsActive:!1,endTime:null,pausedAt:Date.now(),taskId:e.timerState.taskId};chrome.storage.local.set({timerState:a}),chrome.alarms.clear("pomodoroEnd"),chrome.action.setBadgeText({text:""})}}))}function c(e,t){console.log("Timer completed:",e),"POMODORO"===e&&(r=!1,i(),s()),chrome.notifications.create("timer-completed-notification",{type:"basic",iconUrl:"/assets/icons/icon128.png",title:"".concat(e," Completed!"),message:"POMODORO"===e?"Time for a break!":"Ready to focus again?"}),chrome.action.setBadgeText({text:""})}chrome.runtime.onInstalled.addListener((function(){console.log("LockIn extension installed"),chrome.storage.local.set({notificationSettings:{allowFrom:["Gmail"],enableDuringBreaks:!0},notifications:[],blockedNotifications:[],notificationStats:{gmail:0,calendar:0}}),chrome.storage.local.get(["tasks"],(function(e){e.tasks||chrome.storage.local.set({focusSessions:[],tasks:{inProgress:[],toDo:[],completed:[],backlog:[]}})}))})),chrome.runtime.onMessage.addListener((function(e,t,a){if(console.log("Received message:",e.action),"START_POMODORO"===e.action)!function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"POMODORO";console.log("Starting focus session:",t),chrome.storage.local.get(["timerState"],(function(o){var a=15e5;"SHORT_BREAK"===t?a=3e5:"LONG_BREAK"===t&&(a=9e5);var i=Date.now()+a;r=!0,n();var s={savedType:t||"POMODORO",savedMinutes:Math.floor(a/6e4),savedSeconds:0,savedIsActive:!0,endTime:i,pausedAt:null,taskId:e};chrome.storage.local.set({timerState:s,activeTimer:e}),chrome.alarms.clear("pomodoroEnd"),chrome.alarms.create("pomodoroEnd",{when:i}),chrome.notifications.create("focus-mode-notification",{type:"basic",iconUrl:"/assets/icons/icon128.png",title:"Focus Mode Activated",message:"Notifications will be filtered for the next "+s.savedMinutes+" minutes."}),chrome.action.setBadgeText({text:"ON"}),chrome.action.setBadgeBackgroundColor({color:"#F87060"})}))}(e.taskId,e.timerType);else if("PAUSE_POMODORO"===e.action)console.log("Pausing focus session"),chrome.storage.local.get(["timerState"],(function(e){if(e.timerState&&e.timerState.savedIsActive){var t=Date.now(),a=Math.max(0,e.timerState.endTime-t),n=Math.floor(a/6e4),s=Math.floor(a%6e4/1e3),c=o(o({},e.timerState),{},{savedIsActive:!1,savedMinutes:n,savedSeconds:s,endTime:null,pausedAt:t});r=!1,i(),chrome.storage.local.set({timerState:c}),chrome.alarms.clear("pomodoroEnd"),chrome.action.setBadgeText({text:"PAUSE"})}}));else if("RESUME_POMODORO"===e.action)console.log("Resuming focus session"),chrome.storage.local.get(["timerState"],(function(e){if(e.timerState&&!e.timerState.savedIsActive){var t=Date.now()+1e3*(60*e.timerState.savedMinutes+e.timerState.savedSeconds);r=!0,n();var a=o(o({},e.timerState),{},{savedIsActive:!0,endTime:t,pausedAt:null});chrome.storage.local.set({timerState:a}),chrome.alarms.create("pomodoroEnd",{when:t}),chrome.action.setBadgeText({text:"ON"})}}));else if("END_POMODORO"===e.action)s();else if("TIMER_COMPLETED"===e.action)c(e.timerType,e.taskId);else if("CLEAR_NOTIFICATIONS"===e.action)chrome.storage.local.set({notifications:[],notificationStats:{gmail:0,calendar:0}});else if("CHECK_FOCUS_MODE"===e.action)return a({isBlocking:r}),!0})),chrome.alarms.onAlarm.addListener((function(e){"pomodoroEnd"===e.name&&(console.log("Pomodoro end alarm triggered"),chrome.storage.local.get(["timerState"],(function(e){if(e.timerState&&e.timerState.savedIsActive){var t=e.timerState.savedType||"POMODORO";e.timerState.taskId,c(t)}})))}))})();