import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAwAB4hkHAOh1vkZWYAt0ii4jPLEKJxBTA",
    authDomain: "fitnus-d2c2b.firebaseapp.com",
    databaseURL: "https://fitnus-d2c2b.firebaseio.com",
    projectId: "fitnus-d2c2b",
    storageBucket: "fitnus-d2c2b.appspot.com",
    messagingSenderId: "1028682263241",
    appId: "1:1028682263241:web:c9d5e21cecd394d8c97b18"
};

firebase.initializeApp(firebaseConfig)

firebase.firestore()

export default firebase