const admin = require("firebase-admin");
admin.initializeApp();

const auth      = require("./src/auth");
const students  = require("./src/students");
const exercises = require("./src/exercises");
const workouts  = require("./src/workouts");
const sessions  = require("./src/sessions");
const dashboard = require("./src/dashboard");
const ranking   = require("./src/ranking");
const accounts  = require("./src/accounts");

Object.assign(exports, auth, students, exercises, workouts, sessions, dashboard, ranking, accounts);
