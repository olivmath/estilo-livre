import { call } from "../lib/firebase";

export const getTemplates          = ()                    => call("getTemplates")();
export const createTemplate        = (data)                => call("createTemplate")(data);
export const updateTemplate        = (id, data)            => call("updateTemplate")({ id, data });
export const deleteTemplate        = (id)                  => call("deleteTemplate")({ id });
export const getStudentWorkouts    = (uid)                 => call("getStudentWorkouts")({ uid });
export const assignTemplate        = (uid, templateId)     => call("assignTemplate")({ uid, templateId });
export const createCustomWorkout   = (uid, data)           => call("createCustomWorkout")({ uid, data });
export const updateStudentWorkout  = (uid, wkId, data)     => call("updateStudentWorkout")({ uid, wkId, data });
export const deleteStudentWorkout  = (uid, wkId)           => call("deleteStudentWorkout")({ uid, wkId });
