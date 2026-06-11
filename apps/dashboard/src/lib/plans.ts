import type { Plan, PlanLimits } from "@passaporto/shared";

export interface PlanDefinition extends PlanLimits {
  priceMonthly: number;
  featureKeys: string[];
}

export const plans: Record<Plan, PlanDefinition> = {
  trial: {
    plan: "trial",
    priceMonthly: 0,
    maxProducts: 3,
    csvImport: false,
    bulkExport: false,
    api: false,
    multiBrand: false,
    featureKeys: ["maxProducts3", "qr", "publish"],
  },
  starter: {
    plan: "starter",
    priceMonthly: 49,
    maxProducts: 100,
    csvImport: false,
    bulkExport: false,
    api: false,
    multiBrand: false,
    featureKeys: ["maxProducts100", "qr", "publish", "support"],
  },
  pro: {
    plan: "pro",
    priceMonthly: 149,
    maxProducts: 1000,
    csvImport: true,
    bulkExport: true,
    api: false,
    multiBrand: false,
    featureKeys: ["maxProducts1000", "qr", "publish", "csvImport", "bulkExport", "support"],
  },
  filiera: {
    plan: "filiera",
    priceMonthly: 399,
    maxProducts: Number.POSITIVE_INFINITY,
    csvImport: true,
    bulkExport: true,
    api: true,
    multiBrand: true,
    featureKeys: ["unlimited", "qr", "publish", "csvImport", "bulkExport", "api", "multiBrand", "support"],
  },
};

export const planOrder: Plan[] = ["trial", "starter", "pro", "filiera"];

export function getPlan(plan: Plan): PlanDefinition {
  return plans[plan];
}
