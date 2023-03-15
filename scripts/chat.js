
import { initializeApp } from 'firebase/app'
import {
    getFirestore, collection, serverTimestamp, Timestamp,
    addDoc, onSnapshot, doc, where, query, orderBy, getDoc,
    updateDoc, getDocs
} from 'firebase/firestore'
import {
    getAuth,
    createUserWithEmailAndPassword,
    signOut, signInWithEmailAndPassword,
    onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
  }

  //init firebase app
  initializeApp(firebaseConfig)

  // init services
  const db = getFirestore();
  const auth = getAuth();


class Chatroom {
    constructor(room, username){
        this.room = room;
        this.username =username;
        this.chats = collection(db, 'chats');
        this.unsub;
    }
    async addChat(message){
        const now = new Date();
        const timestamp = Timestamp.fromDate(now);

        const chat = {
            message: message,
            room: this.room,
            username: this.username,
            created_at: timestamp.toDate()
        };
        // save the chat document
        const response = await addDoc(this.chats, chat)
        return response;
    }
    getChats(callback){
        const q = query(this.chats, where("room", "==", this.room), orderBy("created_at"))

        this.unsub = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach(change => {
            if(change.type === 'added'){
                callback(change.doc.data())
            }
          });
        });
    }
    updateName(username){
        this.username = username;
        localStorage.setItem('username', username);
    }
    updateRoom(room){
        this.room = room;
        console.log("room updated");
        if(this.unsub){
            this.unsub();
        }
    }

}

const { ChatUI } = require("./ui.js");

// DOM queries
// chat queries
const chatList = document.querySelector(".chat-list");
const newChatForm = document.querySelector(".new-chat");
const updateMssg = document.querySelector(".update-mssg");
const rooms = document.querySelector(".chat-rooms");
const chatInterface = document.querySelector(".chat-interface-hidden")

// form queries
const createAccountForm = document.querySelector('.create-account-form');
const loginForm = document.querySelector('.login-form');
const showLoginLink = document.querySelector(".show-login-link");
const showCreateAccountLink = document.querySelector('.show-create-account-link');
const landingInterface = document.querySelector('.landing-page')
const signUpMessage = document.querySelector(".signup-update")


// form manipulations

// Show the login form when the "Sign in" link is clicked
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    createAccountForm.style.display = 'none';
    loginForm.style.display = 'block';
  });
  
  // Show the create account form when the "Create an account" link is clicked
  showCreateAccountLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    createAccountForm.style.display = 'block';
  });

  // Sign users up
  createAccountForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const name = createAccountForm.name.value
    const email = createAccountForm.email.value
    const password = createAccountForm.password.value

    createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
        console.log('user created:', cred.user)
        createAccountForm.reset();
        const userName = name.trim();
        landingInterface.style.display = 'none';
        chatInterface.style.display = 'block';
        chatroom.updateName(userName);
        updateMssg.textContent = `Sign up successful. You are now logged in as ${userName}`
        setTimeout(() => updateMssg.textContent = '', 3000);
    })

    .catch((err) => {
        console.log(err.code, err.message)
        if (err.code === 'auth/weak-password') {
            console.log(err.message);
            let passwordErrorMessage = "Password should be at least 6 characters";
            signUpMessage.textContent = `${passwordErrorMessage}`
            setTimeout(() => signUpMessage.textContent = '', 5000);
        } else if (err.code === 'auth/invalid-email') {
            console.log(err.message);
            let emailErrorMessage = "Enter a valid email";
            signUpMessage.textContent = `${emailErrorMessage}`
            setTimeout(() => signUpMessage.textContent = '', 5000);
        } else if (err.code === 'auth/email-already-in-use') {
            console.log(err.message);
            let emailInUseErrorMessage = "This email is already in use, login instead.";
            signUpMessage.textContent = `${emailInUseErrorMessage}`
            setTimeout(() => signUpMessage.textContent = '', 5000);
        }
    });

  });

//   Login Users
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = loginForm.name.value
    const email = loginForm.email.value
    const password = loginForm.password.value

    signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
        console.log('user signed in:', cred.user)
        loginForm.reset()
        const userName = name.trim();
        landingInterface.style.display = 'none';
        chatInterface.style.display = 'block';
        chatroom.updateName(userName);
        updateMssg.textContent = `Login successful. You are now logged in as ${userName}`
        setTimeout(() => updateMssg.textContent = '', 3000);
    })
    .catch((err) => {
        console.log(err.message)
    })
})


// add a new chat
newChatForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = newChatForm.message.value.trim()
    chatroom.addChat(message)
    .then(() => {
        newChatForm.reset()
    })
    .catch(err => console.log(err));
});

// // update username
// newNameForm.addEventListener('submit', e => {
//     e.preventDefault();
//     // update name via form
//     const newName = newNameForm.name.value.trim();
//     chatroom.updateName(newName);
//     // reset the form
//     newNameForm.reset();
//     // show then hide the update message
//     updateMssg.textContent = `Your name has been updated to ${newName}`
//     setTimeout(() => updateMssg.textContent = '', 3000);
// });

// update the chat room
rooms.addEventListener('click', e => {
    if(e.target.tagName === 'BUTTON'){
      chatUI.clear();
      chatroom.updateRoom(e.target.getAttribute('id'));
      chatroom.getChats(chat => chatUI.render(chat));
    }
})

// check local storage for a name
const username = localStorage.username ? localStorage.username : "anon";

// class instances
const chatroom = new Chatroom('general', username);
const chatUI = new ChatUI(chatList);

chatroom.getChats((data) => chatUI.render(data))








































// const chatroom = new Chatroom('general', 'blaine')

// chatroom.addChat('testing out')
//  .then(() => console.log('chat added'))
//  .catch(err => console.log(err));

// chatroom.getChats((data) => {
//      console.log(data);
// })

// setTimeout(() => {
//     chatroom.updateRoom('gaming');
//     chatroom.updateName('Fifafreak');
//     chatroom.getChats((data) => {
//         console.log(data);
//    });
//    chatroom.addChat('hello gamers')
// }, 3000)

