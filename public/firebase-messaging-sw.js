importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAl5sDh6_a_PFnNHXUGtp_-Q9rSghW462k",
    authDomain: "tariff-ai.firebaseapp.com",
    projectId: "tariff-ai",
    messagingSenderId: "720726082534",
    appId: "1:720726082534:web:dc76d77eab2c6d93e28c27",
    measurementId: "G-J2SXQ0BFZC"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    title: payload.notification.title,
    // icon: '/firebase-logo.png', // optional icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

messaging.onMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received foreground message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    title: payload.notification.title,
    // icon: '/firebase-logo.png', // optional icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
