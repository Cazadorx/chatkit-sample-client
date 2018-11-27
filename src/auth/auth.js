import auth0 from "auth0-js";
import history from "../history"
import jwtdecode from "jwt-decode"

export default class Auth {

  auth0 = new auth0.WebAuth({
    domain: 'pusher-chatkit-demo.auth0.com',
    clientID: 'VF0kHM9szMj0aQGEfqafrdAKVwRb2a3Q',
    redirectUri: "https://zmarkan.github.io/chatkit-sample-client/callback",
    responseType: "token id_token",
    scope: "openid email profile"
  });

  constructor() {
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.handleAuthentication = this.handleAuthentication.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.getAuthToken = this.getAuthToken.bind(this)
    this.getUserId = this.getUserId.bind(this)
  }

  handleAuthentication(callback) {
    this.auth0.parseHash((err, authResult) => {

        if (authResult && authResult.accessToken && authResult.idToken) {
            this.setSession(authResult);
            const email = this.getUserId(authResult.idToken)
            callback(authResult, email)
        } else if (err) {
          history.replace('/error');
          console.log(err);
          alert(`Error: ${err.error}. Check the console for further details.`);
        }
      });  
    }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime())
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)

    const idToken = jwtdecode(authResult.idToken)
    const email = idToken.email
    localStorage.setItem('chatkit_user', email)
    console.log("SET SESSION")
  }

  logout() {
    // Clear Access Token and ID Token from local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('chatkit_user')
    // navigate to the home route
    // history.replace('/home');s
  }

  isAuthenticated() {
    // Check whether the current time is past the 
    // Access Token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  login() {
    this.auth0.authorize();    
  }

  getAuthToken() {
    return localStorage.getItem('access_token')
  }

  getUserId(idToken) { //Unsafe, not verified
      return jwtdecode(idToken).email
  }
}
