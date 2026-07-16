import { create } from "zustand";
import type { Space } from "@/types";
import {
  recommendSpaces,
  exploreSpaces,
} from "@/features/guest-explore/api/mock_spaces";

interface SpaceState {
  spaces: Space[];
  adjustHeartCount: (spaceId: number, delta: 1 | -1) => void;
}

export const useSpaceStore = create<SpaceState>((set) => ({
  spaces: [...recommendSpaces, ...exploreSpaces],
  adjustHeartCount: (spaceId, delta) =>
    set((state) => ({
      spaces: state.spaces.map((space) =>
        space.id === spaceId
          ? { ...space, heartCount: space.heartCount + delta }
          : space,
      ),
    })),
}));
