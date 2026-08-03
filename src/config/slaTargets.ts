/** SLA behavior thresholds. Days are business-day approximations for the pilot. */

export const AT_RISK_FRACTION = 0.75; // clock state flips to "at risk" past 75% of SLA window

export const EXPEDITED_SLA_DAYS = 2; // urgent retention with a written competing offer

/** Queue burn-down assumption: weighted units a capability pool clears per day. */
export const BURNDOWN_UNITS_PER_DAY = 6;
