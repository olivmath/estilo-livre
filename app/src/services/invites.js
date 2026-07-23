import { call } from "../lib/firebase";

export const redeemInviteCode  = (code) => call("redeemInviteCode")({ code });
export const getMyInviteCode   = ()     => call("getMyInviteCode")();
export const generateInviteCode = ()    => call("generateInviteCode")();
