// const firebase = require('firebase/compat/app');
// require('firebase/compat/firestore');
// // your Firebase configuration and Firestore code goes here

// const { getFirestore, collection} = require('firebase/firestore');

// const firebaseConfig = {
//     apiKey: "AIzaSyDf0w2VBHzVzIGb4liTjMbFVp2HWUtZw0E",
//     authDomain: "i-got-this-1.firebaseapp.com",
//     databaseURL: "https://i-got-this-1-default-rtdb.firebaseio.com",
//     projectId: "i-got-this-1",
//     storageBucket: "i-got-this-1.appspot.com",
//     messagingSenderId: "1045118520961",
//     appId: "1:1045118520961:web:7bc04e737096c7b3c00780",
//     measurementId: "G-N1TMBY1FQ8"
//   };

  
// // firebase.initializeApp(firebaseConfig); //initialize firebase app 
// // const db = getFirestore();
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
// // console.log(db)
// // console.log('usersRef')

// // const usersRef = db.collection('users').doc('people');
// // console.log(usersRef)
// module.exports = { db }; //export the app