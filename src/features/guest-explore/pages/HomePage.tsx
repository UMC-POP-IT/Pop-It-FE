import { ExplorePage } from "@/features/guest-explore/pages/ExplorePage";

// "/"와 "/explore" 모두 같은 화면(히어로 검색바 + AI 추천/실시간 추천/공간 탐색)을
// 보여준다 - 실제 구성은 ExplorePage가 전부 담당한다.
export const HomePage = () => <ExplorePage />;
