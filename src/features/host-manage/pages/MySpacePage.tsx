import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/shared/components/Modal";
import { fetchMySpaces, deleteSpace } from "@/features/host-manage/api/hostApi";
import type { ApiMySpace } from "@/types";
import iconPlus from "@/assets/icons/icon_plus.svg";
import { useRegisterStore } from "@/store/registerStore";

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${days[d.getDay()]})`;
};

export const MySpacePage = () => {
  const reset = useRegisterStore((s) => s.reset);
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState<ApiMySpace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadSpaces = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const all: ApiMySpace[] = [];
      const MAX_PAGES = 20;
      let page = 0;
      while (page < MAX_PAGES) {
        const result = await fetchMySpaces({ size: 10, page });
        all.push(...(result.spaces ?? []));
        if (!result.hasNext) break;
        page += 1;
      }
      setSpaces(all);
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 403) {
        navigate("/host/host-register", { replace: true });
        return;
      }
      console.error("[MySpacePage] 내 공간 로드 실패:", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpaces();
  }, [loadSpaces]);


  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteSpace(deleteTargetId);
      setSpaces((prev) => prev.filter((s) => s.spaceId !== deleteTargetId));
    } catch {
      // 실패 시 목록 다시 로드
      await loadSpaces();
    }
    setDeleteTargetId(null);
  };

  const handleEdit = () => {
    if (editTargetId === null) return;
    navigate(`/host/register/edit/${editTargetId}`);
    setEditTargetId(null);
  };

  if (isLoading) {
    return (
      <div className="bg-tag-bg flex h-[224px] w-full items-center justify-center rounded-xl">
        <p className="text-text-primary text-xl font-medium">불러오는 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-tag-bg flex h-[224px] w-full flex-col items-center justify-center gap-3 rounded-xl">
        <p className="text-text-primary text-xl font-medium">공간 목록을 불러오지 못했어요</p>
        <button
          onClick={loadSpaces}
          className="bg-primary text-white rounded-lg px-5 py-2 text-sm font-medium"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pt-[48px]">
      {/* 페이지 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-primary text-[28px] font-bold">내 공간</h1>
          <p className="text-text-tertiary text-lg font-medium">
            내가 등록한 공간을 한곳에서 모아보세요
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            navigate("/host/register");
          }}
          className="bg-primary-hover hover:bg-primary flex items-center gap-1 rounded-lg px-4 py-3 text-base font-bold text-white"
        >
          <img
            src={iconPlus}
            alt=""
            className="h-6 w-6"
          />
          새 공간 등록
        </button>
      </div>

      {/* 공간 목록 */}
      {spaces.length > 0 ? (
        <div className="flex flex-col bg-white">
          {spaces.map((space, index) => (
            <div
              key={space.spaceId}
              className={`relative flex items-end justify-between gap-7 py-5 ${
                index !== spaces.length - 1 ? "border-divider border-b" : ""
              }`}
            >
              {/* 드롭다운 — 카드 오른쪽 상단 */}
              <div
                className="absolute top-5 right-0"
                ref={openMenuId === space.spaceId ? menuRef : null}
              >
                <button
                  onClick={() =>
                    setOpenMenuId((prev) =>
                      prev === space.spaceId ? null : space.spaceId,
                    )
                  }
                  className="text-text-secondary hover:text-text-primary flex h-7 w-7 items-center justify-center rounded text-xl"
                  aria-label="더보기"
                >
                  ···
                </button>
                {openMenuId === space.spaceId && (
                  <div className="absolute top-9 right-0 z-10 flex flex-col overflow-hidden rounded-[8px] border border-[#f2f2f2] bg-white px-[6px] py-2 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.1)]">
                    <button
                      onClick={() => {
                        setEditTargetId(space.spaceId);
                        setOpenMenuId(null);
                      }}
                      className="text-text-primary rounded-[4px] px-8 py-2 text-center text-base font-bold whitespace-nowrap hover:bg-[#f2f2f2]"
                    >
                      공간 수정
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTargetId(space.spaceId);
                        setOpenMenuId(null);
                      }}
                      className="rounded-[4px] px-8 py-2 text-center text-base font-bold whitespace-nowrap text-[#f74b4b] hover:bg-[#f2f2f2]"
                    >
                      공간 삭제
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-7">
                {/* 공간 이미지 */}
                <div className="bg-thumbnail-bg h-[190px] w-[190px] flex-shrink-0 overflow-hidden">
                  {space.thumbnailUrl && (
                    <img
                      src={space.thumbnailUrl}
                      alt={space.buildingName}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {/* 공간 정보 */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-primary text-base font-bold">등록 완료</span>
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-xl font-bold text-black">{space.buildingName}</p>
                    <p className="text-text-primary text-base">
                      {formatDate(space.registeredAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 공간 상세 버튼 */}
              <button
                onClick={() => navigate(`/host/spaces/${space.spaceId}`)}
                className="bg-surface-blue text-text-primary hover:bg-primary-light h-10 flex-shrink-0 rounded-lg px-6 py-1.5 text-base font-bold"
              >
                공간 상세
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-tag-bg flex h-[224px] w-full items-center justify-center rounded-xl">
          <p className="text-text-primary text-xl font-medium">
            아직 등록된 공간이 없어요
          </p>
        </div>
      )}

      {/* 공간 수정 확인 모달 */}
      <Modal
        isOpen={editTargetId !== null}
        title="공간을 수정하시겠습니까?"
        confirmLabel="수정하기"
        cancelLabel="돌아가기"
        onConfirm={handleEdit}
        onCancel={() => setEditTargetId(null)}
      />

      {/* 공간 삭제 확인 모달 */}
      <Modal
        isOpen={deleteTargetId !== null}
        title={`공간을 삭제하면 복구할 수 없습니다\n삭제 하시겠습니까?`}
        confirmLabel="삭제하기"
        cancelLabel="돌아가기"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
