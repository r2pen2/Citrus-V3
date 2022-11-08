const express = require('express')
const router = express.Router()

// define the home page route
router.get('/', (req, res) => {
  res.send("404: Not technically a 404??? I mean— this route exists but you're not supposed to be here!");
})

/**
 * Send under construction page to user
 * @param {HTTPResponse} res res from GET 
 */
function sendPageUnderConstruction(res) {
    res.sendFile(__dirname + "/static/pages/pageUnderConstruction.html");
}

router.get("/credits", (req, res) => {
    res.sendFile(__dirname + "/static/pages/credits.html");
})
router.get("/features", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/apps", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/pricing", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/faq", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/billing", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/roadmap", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/blog", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/support", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/status", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/privacy", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/terms", (req, res) => {
    sendPageUnderConstruction(res);
})
router.get("/eula", (req, res) => {
    sendPageUnderConstruction(res);
})

module.exports = router