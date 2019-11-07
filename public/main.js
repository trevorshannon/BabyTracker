// Signs-in.
function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

// Signs-out.
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Initiate firebase auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}


// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var picUrl = getProfilePicUrl();
    var name = getUserName();

    // Set the user's profile pic and name.
    userPicture.setAttribute('src', addSizeToGoogleProfilePic(picUrl));
    userName.textContent = name;

    // Show user's profile and sign-out button.
    signOutButton.removeAttribute('hidden');
    userPicture.removeAttribute('hidden');
    userName.removeAttribute('hidden');
    dataEntry.removeAttribute('hidden');
    dataSummary.removeAttribute('hidden');

    // Hide sign-in button.
    signInButton.setAttribute('hidden', true);

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    signOutButton.setAttribute('hidden', true);
    userPicture.setAttribute('hidden', true);
    userName.setAttribute('hidden', true);
    dataEntry.setAttribute('hidden', true);
    dataSummary.setAttribute('hidden', true);

    // Show sign-in button.
    signInButton.removeAttribute('hidden');

  }
}


// initialize Firebase
initFirebaseAuth();

// Remove the warning about timstamps change. 
var firestore = firebase.firestore();
let signInButton = document.getElementById('sign-in');
let signOutButton = document.getElementById('sign-out');
let userPicture = document.getElementById('profile-pic');
let userName = document.getElementById('user-name');
let dataEntry = document.getElementById('data-entry');
let dataSummary = document.getElementById('data-summary');

signOutButton.addEventListener('click', signOut);
signInButton.addEventListener('click', signIn);