import type {
  LeagueRepository,
  ProfileRepository,
  ProofEventRepository,
  ReceiptRepository,
  ReferralRepository,
  SocialRepository,
} from "./interfaces.js";
import { SqliteProfileRepository } from "./sqlite/profile.js";
import { SqliteReferralRepository } from "./sqlite/referral.js";
import { SqliteLeagueRepository } from "./sqlite/league.js";
import { SqliteReceiptRepository } from "./sqlite/receipt.js";
import { SqliteSocialRepository } from "./sqlite/social.js";
import { SqliteProofEventRepository } from "./sqlite/proof-events.js";

export interface Repositories {
  profile: ProfileRepository;
  referral: ReferralRepository;
  league: LeagueRepository;
  receipt: ReceiptRepository;
  social: SocialRepository;
  proofEvents: ProofEventRepository;
}

let cached: Repositories | null = null;

export function getRepositories(): Repositories {
  if (!cached) {
    cached = {
      profile: new SqliteProfileRepository(),
      referral: new SqliteReferralRepository(),
      league: new SqliteLeagueRepository(),
      receipt: new SqliteReceiptRepository(),
      social: new SqliteSocialRepository(),
      proofEvents: new SqliteProofEventRepository(),
    };
  }
  return cached;
}
