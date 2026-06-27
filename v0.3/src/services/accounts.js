import { call } from "../lib/firebase";

export const getAccounts   = ()             => call("getAccounts")();
export const createAccount = (data)         => call("createAccount")(data);
export const deleteAccount = (uid)          => call("deleteAccount")({ uid });
export const setUserRole   = (targetUid, newRole) => call("setUserRole")({ targetUid, newRole });
