//file: script.js
$(document).ready(() => {
  //initialize the firebase app
  const config = {
    apiKey: "AIzaSyCBZY44K5wEAJWXf_b91IyjEyt1R9DRpYE",
    authDomain: "login-f1d27.firebaseapp.com",
    projectId: "login-f1d27",
    storageBucket: "login-f1d27.appspot.com",
    messagingSenderId: "564096441482",
    appId: "1:564096441482:web:edb935b986dbb1c995e173"
  };
  firebase.initializeApp(config);

    //create firebase references
    const Auth = firebase.auth(); 
    const dbRef = firebase.database();
    const contactsRef = dbRef.ref('contacts')
    const usersRef = dbRef.ref('users')
    let auth = null;
  
    //Register
    $('#registerForm').on('submit', (e) => {
      e.preventDefault();
      $('#registerModal').modal('hide');
      $('#messageModalLabel').html(spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));
      $('#messageModal').modal('show');
      const data = {
        email: $('#registerEmail').val(), //get the email from Form
        firstName: $('#registerFirstName').val(), // get firstName
        lastName: $('#registerLastName').val(), // get lastName
      };
      const passwords = {
        password : $('#registerPassword').val(), //get the pass from Form
        cPassword : $('#registerConfirmPassword').val(), //get the confirmPass from Form
      }
      if (data.email && passwords.password && passwords.cPassword) {
        if (passwords.password == passwords.cPassword) {
          //create the user
          
          firebase.auth()
            .createUserWithEmailAndPassword(data.email, passwords.password)
            .then((user) => user.updateProfile({
                displayName: `${data.firstName} ${data.lastName}`
            }))
            .then((user) => {
              //now user is needed to be logged in to save data
              auth = user;
              //now saving the profile data
              usersRef
                .child(user.uid)
                .set(data)
                .then(() => console.log("User Information Saved:", user.uid))
  
              $('#messageModalLabel').html(spanText('Success!', ['center', 'success']))
              $('#messageModal').modal('hide');
            })
            .catch((error) => {
              console.log("Error creating user:", error);
              $('#messageModalLabel').html(spanText('ERROR: '+error.code, ['danger']))
            });
        } else {
          //password and confirm password didn't match
          $('#messageModalLabel').html(spanText("ERROR: Passwords didn't match", ['danger']))
        }
      }  
    });
  
    //Login
    $('#loginForm').on('submit', (e) => {
      e.preventDefault();
      $('#loginModal').modal('hide');
      $('#messageModalLabel').html(spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));
      $('#messageModal').modal('show');
  
      if ($('#loginEmail').val() && $('#loginPassword').val()) {
        //login the user
        const data = {
          email: $('#loginEmail').val(),
          password: $('#loginPassword').val(),
      
        };
        firebase.auth().signInWithEmailAndPassword(data.email, data.password)
          .then((authData) => {
            auth = authData;
            $('#messageModalLabel').html(spanText('Success!', ['center', 'success']))
            $('#messageModal').modal('hide');
          })
          .catch((error) => {
            console.log("Login Failed!", error);
            $('#messageModalLabel').html(spanText('ERROR: '+error.code, ['danger']))
          });
      }
    });
  
    $('#logout').on('click', (e) => {
      e.preventDefault();
      firebase.auth().signOut()
    });
  
   
  
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        auth = user;
        $('body').removeClass('auth-false').addClass('auth-true');
        usersRef.child(user.uid).once('value').then((data) => {
          const info = data.val();
          if (user.photoUrl)  {
            $('.user-info img').show();
            $('.user-info img').attr('src', user.photoUrl);
            $('.user-info .user-name').hide();
          } else if (user.displayName)  {
            $('.user-info img').hide();
            $('.user-info').append('<span class="user-name">'+user.displayName+'</span>');
          } else if (info.firstName)  {
            $('.user-info img').hide();
            $('.user-info').append('<span class="user-name">'+info.firstName+'</span>');
          }
        });
        contactsRef.child(user.uid).on('child_added', onChildAdd);
      } else {
        // No user is signed in.
        $('body').removeClass('auth-true').addClass('auth-false');
        auth && contactsRef.child(auth.uid).off('child_added', onChildAdd);
        $('#contacts').html('');
        auth = null;
      }
    });
  });
  
  const onChildAdd = (snap) => {
    $('#contacts').append(contactHtmlFromObject(snap.key, snap.val()));
  }
  
  
    const spanText = (textStr, textClasses) => {
      const classNames = textClasses.map(c => `text-${c}`).join(' ');
      return `<span class="${classNames}">${textStr}</span>`;
  }