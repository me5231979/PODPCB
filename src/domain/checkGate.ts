import { gateForType, type GateItem } from '../config/gates';
import { requestTypeById, type RequestTypeId } from '../config/requestTypes';

export type GateResult =
  | { ok: true }
  | { ok: false; refused: true; redirectTo: string; reason: string }
  | { ok: false; refused: false; missing: GateItem[] };

/**
 * Completeness gate, enforced at the domain layer so no path around the UI can
 * create an incomplete or refused request.
 */
export function checkGate(typeId: RequestTypeId, clearedItems: string[]): GateResult {
  const type = requestTypeById(typeId);
  if (!type) return { ok: false, refused: true, redirectTo: '', reason: 'Unknown request type.' };
  if (type.refused) {
    return { ok: false, refused: true, redirectTo: type.refused.redirectTo, reason: type.refused.reason };
  }
  const missing = gateForType(typeId).filter((item) => !clearedItems.includes(item.id));
  if (missing.length > 0) return { ok: false, refused: false, missing };
  return { ok: true };
}
