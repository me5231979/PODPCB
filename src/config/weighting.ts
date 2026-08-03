/**
 * Complexity weights and capacity ceilings. Reviewable quarterly.
 * Seeded from stated assumptions; recalibrate against actual cycle times.
 */

export const RISK_FLAG_MULTIPLIERS: Record<string, number> = {
  band_exception: 1.3,
  flsa: 1.1,
  contested: 1.5,
  executive_scope: 1.25,
  urgent_retention: 1.2,
  org_risk: 1.4,
  clinical: 1.15,
  immigration: 1.1,
  mobility_conflict: 1.2,
  offer_rescission: 1.3,
};

/** Business unit complexity factors. Unlisted units default to 1.0. */
export const BU_COMPLEXITY: Record<string, number> = {
  'Operations & Infrastructure': 1.15,
  'School of Medicine Basic Sciences': 1.2,
  'Athletics': 1.1,
};

export const DEFAULT_CAPACITY_CEILING = 100;

/** Load penalty scales sharply as a practitioner approaches ceiling. */
export const LOAD_PENALTY_EXPONENT = 2.5;

/** Score bonus for prior work with the requesting business unit. */
export const CONTINUITY_BONUS = 0.15;

/** Discount applied to capabilities with no supporting evidence in 18 months. */
export const DECAY_DISCOUNT = 0.5;
export const DECAY_MONTHS = 18;

/** Hard override ceiling for anchored ECs — anchoring wins until load passes this. */
export const ANCHOR_OVERRIDE_CEILING = 130;
