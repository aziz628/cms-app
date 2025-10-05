import express  from "express";

// Import routes of all pages 
import dashboard_route from "./dashboard_route.js";
import classes_route from "./classes_route.js"
import schedule_route from "./schedule_route.js";
import pricing_route from "./pricing_route.js";
import trainers_route from "./trainers_route.js";
import gallery_route from "./gallery_route.js";
import events_route from "./events_route.js";
import review_route from "./review_route.js";
import transformation_route from "./transformation_route.js";

// comment the yet to exist routes
/*
*/
import contact_route  from "./contact_route.js";
// Import general info route
import general_info from "./general_info_route.js";

const router = express.Router();

router.use("/dashboard", dashboard_route);
router.use("/classes", classes_route);
router.use("/schedule", schedule_route);
router.use("/pricing", pricing_route);
router.use("/trainers", trainers_route);
router.use("/gallery", gallery_route);
router.use("/events", events_route);
router.use("/review", review_route);
router.use("/transformation", transformation_route);
router.use("/contact", contact_route);
router.use("/general-info", general_info);
// Add more routes as needed

export default router;