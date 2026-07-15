import { call } from "../lib/firebase";

export const getStudentSessions = (uid, limitCount = 50) => call("getStudentSessions")({ uid, limitCount });
export const getRecentActivity  = (limitCount = 20)      => call("getRecentActivity")({ limitCount });
export const updateStudentSession = (uid, sessionId, exs) => call("updateStudentSession")({ uid, sessionId, exs });
