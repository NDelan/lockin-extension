// Override the Notification API
if (window.Notification) {
    window.Notification.requestPermission = function(callback) {
      if (callback) {
        callback('denied');
      }
      return Promise.resolve('denied');
    };

    window.Notification.prototype.close = function() {
      console.log('Notification blocked by LockIn');
    };
  }