import { call } from "../lib/firebase";

export const getExercises    = ()          => call("getExercises")();
export const createExercise  = (data)      => call("createExercise")(data);
export const updateExercise  = (id, data)  => call("updateExercise")({ id, data });
export const deleteExercise  = (id)        => call("deleteExercise")({ id });
