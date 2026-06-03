import { parseAbi } from "viem";
import {
  CFA_FORWARDER_ADDRESS,
  gPerMonthToFlowRate,
} from "@goodpath/shared";

export { CFA_FORWARDER_ADDRESS, gPerMonthToFlowRate };

export const CFA_FORWARDER_ABI = parseAbi([
  "function createFlow(address token, address sender, address receiver, int96 flowRate, bytes userData) returns (bool)",
]);
