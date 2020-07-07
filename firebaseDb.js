import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC4Hu9xfTIUoQ0n61_BHPqb1ESApRXveXw",
    authDomain: "fitnus-95b24.firebaseapp.com",
    databaseURL: "https://fitnus-95b24.firebaseio.com",
    projectId: "fitnus-95b24",
    storageBucket: "fitnus-95b24.appspot.com",
    messagingSenderId: "407964818113",
    appId: "1:407964818113:web:d66da069d86f8092191240"
};

firebase.initializeApp(firebaseConfig)

firebase.firestore()

export default firebase