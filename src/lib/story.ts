export type StoryCoverageCounts = {
  articleCount: number;
  sourceCount: number;
};

export function isMultiSourceStory(story: StoryCoverageCounts): boolean {
  return story.articleCount >= 2 && story.sourceCount >= 2;
}
