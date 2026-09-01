import { getStoryCoverage } from "@/lib/api/news";
import type { CoverageComparison } from "@/types/api";

export async function getOptionalStoryCoverage(
  storyId: string,
  loader: (id: string) => Promise<CoverageComparison> = getStoryCoverage,
): Promise<CoverageComparison | null> {
  try {
    return await loader(storyId);
  } catch {
    return null;
  }
}
