import { call } from "../lib/firebase";

export const getStudents      = ()           => call("getStudents")();
export const getStudent       = (uid)        => call("getStudent")({ uid });
export const createStudent    = (data)       => call("createStudent")(data);
export const updateStudent    = (uid, data)  => call("updateStudent")({ uid, data });
export const deleteStudent    = (uid)        => call("deleteStudent")({ uid });
export const toggleBlock      = (uid)        => call("toggleBlock")({ uid });
export const getStudentStats  = (uid)        => call("getStudentStats")({ uid });
