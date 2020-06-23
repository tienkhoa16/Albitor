import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDOdJLkyET-5aJo6EKCKari3kJnZQULh9E",
    authDomain: "fitnus-54bdc.firebaseapp.com",
    databaseURL: "https://fitnus-54bdc.firebaseio.com",
    projectId: "fitnus-54bdc",
    storageBucket: "fitnus-54bdc.appspot.com",
    messagingSenderId: "438163943669",
    appId: "1:438163943669:web:9ac3c0a61330f22e7d55bc"
};

firebase.initializeApp(firebaseConfig)

firebase.firestore()

export default firebase