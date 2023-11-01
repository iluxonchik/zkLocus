import { Bool, Int64 } from "o1js";
import { provableIsInt64XEqualToInt64Y } from "./Provers";

export function assertInt64XNotEqualsInt64Y(x: Int64, y: Int64): void {
  const isXEqualToY: Bool = provableIsInt64XEqualToInt64Y(x, y);
  isXEqualToY.assertFalse();
}