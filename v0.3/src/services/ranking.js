import { call } from "../lib/firebase";

export const getRanking = (tab) => call("getRanking")({ tab });
