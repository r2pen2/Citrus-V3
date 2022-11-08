// Library imports
import { Button, Typography } from "@mui/material";
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

// Component imports
import GoogleLogo from "../../../assets/images/GoogleLogo.svg";

// API imports
import { signInWithGoogle } from "../../../api/firebase";
import { DBManager } from "../../../api/db/dbManager";
import { SessionManager } from "../../../api/sessionManager";
import { RouteManager } from "../../../api/routeManager";

/**
 * Homepage for login workflow— a button to login with phone and button to login with Google
 */
export default function LoginHome() {
  /**
   * Sign user in with google if button is pressed
   * Set localStorage item and redirect to dashboard
   */
  async function handleSignIn() {
    signInWithGoogle().then(async (newUser) => {
        // Set session details
        SessionManager.setUser(newUser);

        // Create object manager for new user
        // We're not trying to get a UserManager from LocalStorage becuase we know that the user was signed out before this moment
        const userManager = DBManager.getUserManager(newUser.uid);

        // Set these fields even if this isn't a first-time login
        userManager.setLastLoginAt(new Date());
        userManager.setEmailVerified(newUser.emailVerified);
        userManager.setLocation(null);
        
        // See if document exists in DB (meaning we've signed this user in before)
        let documentExists = await userManager.documentExists();
        if (!documentExists) {
          // This is a new user, so we need to do init several fields
          userManager.setCreatedAt(new Date());
          userManager.setDisplayName(newUser.displayName);
          userManager.setEmail(newUser.email);
          userManager.setPfpUrl(newUser.photoURL);
          userManager.setPhoneNumber(null) // We don't know phone number bc we're logging in with google instead
        }
        userManager.push().then(() => {
          // Save this UserManager to localstorage and redirect to dashboard
          SessionManager.setCurrentUserManager(userManager);
          RouteManager.redirect("/dashboard");
        })
    });
  }

  return (
    <div className="login-home-wrapper center-contents-column" data-testid="login-home">
      <Button data-testid="google-button" className="login-btn"  variant="contained" onClick={() => handleSignIn()}>
        <img src={GoogleLogo} alt="Google Logo"/>
        <Typography marginLeft="10px">Sign in with Google</Typography>
      </Button>
      <Button data-testid="phone-button" className="login-btn" variant="contained" onClick={() => {RouteManager.redirect("/login/phone")}}>
        <PhoneIphoneIcon/>
        <Typography marginLeft="10px">Sign in with Phone</Typography>
      </Button>
    </div>
  )
}
