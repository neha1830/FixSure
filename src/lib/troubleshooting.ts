import { prisma } from "./db";
import {
  DEFAULT_SCENARIOS,
  type TroubleshootInput,
  type TroubleshootStep,
} from "./troubleshooting-constants";

export * from "./troubleshooting-constants";

export async function ensureScenariosSeeded() {
  const count = await prisma.troubleshootScenario.count();
  if (count > 0) return;

  for (let i = 0; i < DEFAULT_SCENARIOS.length; i++) {
    const s = DEFAULT_SCENARIOS[i];
    await prisma.troubleshootScenario.create({
      data: {
        key: s.key,
        label: s.label,
        description: s.description || null,
        sortOrder: i,
        active: true,
        steps: {
          create: s.steps.map((step, j) => ({
            title: step.title,
            detail: step.detail,
            sortOrder: j,
          })),
        },
      },
    });
  }
}

export async function listScenarios(opts?: { activeOnly?: boolean }) {
  await ensureScenariosSeeded();
  return prisma.troubleshootScenario.findMany({
    where: opts?.activeOnly ? { active: true } : undefined,
    orderBy: { sortOrder: "asc" },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getTroubleshootSteps(
  input: TroubleshootInput
): Promise<TroubleshootStep[]> {
  await ensureScenariosSeeded();

  let scenario = await prisma.troubleshootScenario.findFirst({
    where: { key: input.issueCategory, active: true },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });

  if (!scenario) {
    scenario = await prisma.troubleshootScenario.findFirst({
      where: { key: "other", active: true },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });
  }

  const steps: TroubleshootStep[] = scenario
    ? scenario.steps.map((s) => ({ title: s.title, detail: s.detail }))
    : DEFAULT_SCENARIOS.find((d) => d.key === "other")!.steps;

  return [
    {
      title: `Confirm device: ${input.brand} ${input.model}`,
      detail:
        "Make sure the brand and model match the device label or Settings → About. Wrong model info can lead to wrong parts.",
    },
    ...steps,
  ];
}

