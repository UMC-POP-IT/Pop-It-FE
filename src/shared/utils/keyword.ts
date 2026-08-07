/**
 * 백엔드 keywords 응답은 API마다 "#" 포함 여부가 다르다(ex. "#역삼동" vs "역삼동").
 * Space.keywords는 항상 "#" 없는 원본 문자열만 담는 것을 단일 규칙으로 하고,
 * "#"는 SpaceCard가 렌더링 시점에 붙인다.
 */
export const normalizeKeywords = (keywords: string[]): string[] =>
  keywords.map((keyword) => keyword.trim().replace(/^#/, ""));
