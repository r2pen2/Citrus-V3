// API Imports
import { signOutUser } from "./firebase";
import { RouteManager } from "./routeManager";
import { DBManager } from "./db/dbManager";
import { Debugger } from "./debugger";

const sessionManagerDebugger = new Debugger(Debugger.controllerObjects.SESSIONMANAGER);

/**
 * SessionManager is a tool for interfacing with the browser's localStorage.
 * Keeps page data consistent even after a redirect
 * Allows us to limit DB calls
 */
export class SessionManager {

    /**
     * Get user object saved in localStorage
     * @returns user object or null
     */
    static getUser() {
        return JSON.parse(localStorage.getItem("citrus:user"));
    }

    /**
     * Set user object saved in localStorage
     */
    static setUser(user) {
        localStorage.setItem("citrus:user", JSON.stringify(user));
    }

    /**
     * Get UserManager saved in localStorage or make a new one
     * @returns UserManager from LocalStorage, new UserManager from ID in LocalStorage, or if neither of those keys exist.
     * @usage This method is frequently called at the TOP of a component's file. There's no need for it to be called again when anything updates beacuase it effectively
     * keeps track of itself. Putting this method inside a component will make the component fetch a new UserManager from LocalStorage any time anything changes.
     * That's not REALLY a problem, but it's bad practice and clutters the shit out of the console.
     */
    static getCurrentUserManager() {
        const data = JSON.parse(localStorage.getItem("citrus:currentUserManagerData"));
        if (data) {
            sessionManagerDebugger.logWithPrefix("Found current user manager!");
            // This is kinda fucked...
            // We have to harvest the data from the found manager and put it into a new one
            // Just a quirk of how localStorage handles classes. Without doing this we'd get an object with no methods attached to it
            // for whatever reason >:(
            return DBManager.createUserManagerFromLocalStorage(this.getUserId(), data);
            // Holy shit that worked! This is kind of an ugly solution but hey, it's only gross under the hood. 
        }
        sessionManagerDebugger.logWithPrefix("Couldn't find a current user object manager. Making a new one...");
        const id = this.getUserId(); // Get user ID from LS
        if (!id) {
            sessionManagerDebugger.logWithPrefix("Couldn't find a current user Id. Redirecting to /login!'");
            return null;
        }
        const newManager = DBManager.getUserManager(id);
        SessionManager.setCurrentUserManager(newManager);
        return newManager;
    }

    /**
     * Set UserManager saved in localStorage
     */
    static setCurrentUserManager(manager) {
        // Here's a magic trick! We're actually just saving the data field from this userManager.
        localStorage.setItem("citrus:currentUserManagerData", JSON.stringify(manager.data));
    }

    /**
     * Takes a user manager and sets the currentUserManager if id matches the one in localStorage
     * @param {UserManager} manager UserManager to compare ID
     */
    static updateCurrentUserManager(manager) {
        if (manager.documentId === SessionManager.getUserId()) {
            SessionManager.setCurrentUserManager(manager);
        }
    }

    /**
     * Gets a user manager, either new or from localStorage if userId matches
     * @param {string} userId id of user to get manager for
     * @returns UserManager for userId
     */
    static getUserManagerById(userId) {
        if (userId === SessionManager.getUserId()) {
            return SessionManager.getCurrentUserManager();
        } else {
            return DBManager.getUserManager(userId);
        }
    }

    /**
     * Get user id from user in localstorage
     * @returns user id or null
     */
    static getUserId() {
        const user = JSON.parse(localStorage.getItem("citrus:user"));
        return user ? user.uid : null;
    }

    /**
     * Get profile picture URL saved in localStorage
     * @returns profile picture URL or empty string
     */
    static getPfpUrl() {
        return localStorage.getItem("citrus:pfpUrl") ? localStorage.getItem("citrus:pfpUrl") : "";
    }

    /**
     * Set profile picture URL saved in localStorage
     */
    static setPfpUrl(pfpUrl) {
        localStorage.setItem("citrus:pfpUrl", pfpUrl);
    }

    /**
     * Get display name saved in localStorage
     * @returns display name or empty string
     */
    static getDisplayName() {
        return localStorage.getItem("citrus:displayName") ? localStorage.getItem("citrus:displayName") : "";
    }

    /**
     * Set display name saved in localStorage
     */
    static setDisplayName(displayName) {
        localStorage.setItem("citrus:displayName", displayName);
    }

    /**
     * Get phone number saved in localStorage
     * @returns phone number or empty string
     */
    static getPhoneNumber() {
        return localStorage.getItem("citrus:phoneNumber") ? localStorage.getItem("citrus:phoneNumber") : "";
    }

    /**
     * Set phone number saved in localStorage
     */
    static setPhoneNumber(phoneNumber) {
        localStorage.setItem("citrus:phoneNumber", phoneNumber);
    }

    /**
    * Get debug mode setting saved in localStorage
    * @returns debug mode setting
    */
    static getDebugMode() {
        return JSON.parse(localStorage.getItem("citrus:debug"));
    }

    /**
    * Set debug mode setting saved in localStorage
    */
    static setDebugMode(debugMode) {
        localStorage.setItem("citrus:debug", JSON.stringify(debugMode));
    }

    /**
     * Check whether or not a user is saved in LS
     * @returns whether or not there is a user stored in LS
     */
    static userInLS() {
        return localStorage.getItem("citrus:user") ? true : false;
    }



    /**
     * Checks whether a user is completely signed in based on whether or not they have a display name
     * @returns whether or not the user has completed signin process
     */
    static userFullySignedIn() {
        const user = SessionManager.getUser();
        if (user) {
            if (user.displayName === null) {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
        }
    }

    /**
     * Clear all citrus related localstorage keys
     */
    static clearLS() {
        localStorage.removeItem("citrus:user");
        localStorage.removeItem("citrus:debug");
        localStorage.removeItem("citrus:pfpUrl");
        localStorage.removeItem("citrus:displayName");
        localStorage.removeItem("citrus:currentUserManager");
    }

    /**
     * Get a JSON representation of current citrus localStorage.
     * This is for debugging
     * @returns JSON representation of localStorage
     */
    static getJSON() {
        return {
            user: this.getUser(),
            pfpUrl: this.getPfpUrl(),
            displayName: this.getDisplayName(),
            debugMode: this.getDebugMode(),
            userId: this.getUserId(),
            currentUserManager: this.getCurrentUserManager()
        }
    }

    /**
     * Completely sign out user with firebase and redirect to /home
     */
    static signOut() {
        signOutUser().then(() => {
            RouteManager.redirect("/home");
        });
    }

    static async reloadUser() {
        return new Promise(async (resolve, reject) => {
            const newUserManager = DBManager.getUserManager(this.getUserId());
            await newUserManager.fetchData();
            this.setCurrentUserManager(newUserManager);
            resolve(newUserManager);
        })
    }
}