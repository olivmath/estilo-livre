import { call } from "../lib/firebase";

export const getTreinos            = ()                    => call("getTemplates")();
export const createTreino          = (data)                => call("createTemplate")(data);
export const updateTreino          = (id, data)            => call("updateTemplate")({ id, data });
export const deleteTreino          = (id)                  => call("deleteTemplate")({ id });
export const getStudentWorkouts    = (uid)                 => call("getStudentWorkouts")({ uid });
export const assignTreino          = (uid, treinoId)       => call("assignTemplate")({ uid, templateId: treinoId });
export const createCustomWorkout   = (uid, data)           => call("createCustomWorkout")({ uid, data });
export const updateStudentWorkout  = (uid, wkId, data)     => call("updateStudentWorkout")({ uid, wkId, data });
export const deleteStudentWorkout  = (uid, wkId)           => call("deleteStudentWorkout")({ uid, wkId });
export const reorderStudentWorkouts = (uid, orderedIds)    => call("reorderStudentWorkouts")({ uid, orderedIds });
