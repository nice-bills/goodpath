/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as explore from "../explore.js";
import type * as lib_address from "../lib/address.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_ensureProfile from "../lib/ensureProfile.js";
import type * as lib_leagueLogic from "../lib/leagueLogic.js";
import type * as lib_leagueWrites from "../lib/leagueWrites.js";
import type * as lib_profileLogic from "../lib/profileLogic.js";
import type * as lib_proofType from "../lib/proofType.js";
import type * as lib_questComplete from "../lib/questComplete.js";
import type * as lib_referrals from "../lib/referrals.js";
import type * as lib_returns from "../lib/returns.js";
import type * as profiles from "../profiles.js";
import type * as questApply from "../questApply.js";
import type * as quests from "../quests.js";
import type * as receipt from "../receipt.js";
import type * as runs from "../runs.js";
import type * as seed from "../seed.js";
import type * as social from "../social.js";
import type * as stats from "../stats.js";
import type * as verify from "../verify.js";
import type * as verify_client from "../verify/client.js";
import type * as verify_deploy from "../verify/deploy.js";
import type * as verify_gooddollar from "../verify/gooddollar.js";
import type * as verify_gsOutflow from "../verify/gsOutflow.js";
import type * as verify_identity from "../verify/identity.js";
import type * as verify_registry from "../verify/registry.js";
import type * as verify_transfer from "../verify/transfer.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  explore: typeof explore;
  "lib/address": typeof lib_address;
  "lib/dates": typeof lib_dates;
  "lib/ensureProfile": typeof lib_ensureProfile;
  "lib/leagueLogic": typeof lib_leagueLogic;
  "lib/leagueWrites": typeof lib_leagueWrites;
  "lib/profileLogic": typeof lib_profileLogic;
  "lib/proofType": typeof lib_proofType;
  "lib/questComplete": typeof lib_questComplete;
  "lib/referrals": typeof lib_referrals;
  "lib/returns": typeof lib_returns;
  profiles: typeof profiles;
  questApply: typeof questApply;
  quests: typeof quests;
  receipt: typeof receipt;
  runs: typeof runs;
  seed: typeof seed;
  social: typeof social;
  stats: typeof stats;
  verify: typeof verify;
  "verify/client": typeof verify_client;
  "verify/deploy": typeof verify_deploy;
  "verify/gooddollar": typeof verify_gooddollar;
  "verify/gsOutflow": typeof verify_gsOutflow;
  "verify/identity": typeof verify_identity;
  "verify/registry": typeof verify_registry;
  "verify/transfer": typeof verify_transfer;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
