import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "@/shared/components/Modal";
import { mockHostSpaces } from "@/features/host-manage/api/mock_host_data";
import iconPlus from "@/assets/icons/icon_plus.svg";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} (${days[d.getDay()]})`;
};

export const MySpacePage = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      {/* 페이지 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-text-primary text-[28px] font-bold">내 공간</h1>
          <p className="text-lg font-medium text-[#747474]">
            내가 등록한 공간을 한곳에서 모아보세요
          </p>
        </div>
        <button
          onClick={() => navigate("/host/register")}
          className="bg-primary-hover flex items-center gap-1 rounded-lg px-4 py-3 text-base font-medium text-white"
        >
          <img
            src={iconPlus}
            alt=""
            className="h-6 w-6"
          />
          새 공간 등록
        </button>
      </div>

      {/* 공간 목록 — 선으로만 구분, 개별 카드 없음 */}
      {mockHostSpaces.length > 0 ? (
        <div className="flex flex-col bg-white">
          {mockHostSpaces.map((space, index) => (
            <div
              key={space.id}
              className={`flex items-end justify-between gap-7 py-5 ${
                index !== mockHostSpaces.length - 1
                  ? "border-b border-[#d8d8d8]"
                  : ""
              }`}
            >
              <div className="flex items-start gap-7">
                {/* 공간 이미지 */}
                <div className="bg-thumbnail-bg h-[190px] w-[190px] flex-shrink-0 overflow-hidden">
                  {space.imageUrls[0] && (
                    <img
                      src={space.imageUrls[0]}
                      alt={space.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {/* 공간 정보 */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-primary text-base font-bold">
                    등록 완료
                  </span>
                  <div className="flex flex-col items-start gap-1">
                    <p className="text-xl font-bold text-black">{space.name}</p>
                    <p className="text-text-primary text-base">
                      {formatDate(space.registeredAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 공간 상세 버튼 */}
              <button
                onClick={() => navigate(`/host/spaces/${space.id}`)}
                className="bg-surface-blue text-text-primary h-10 flex-shrink-0 rounded-lg px-6 py-1.5 text-base font-bold"
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

      {/* 공간 등록 완료 모달 */}
      <Modal
        isOpen={showSuccessModal}
        title="공간이 성공적으로 등록되었습니다!"
        showCheckIcon
        singleButton
        confirmLabel="확인"
        onConfirm={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
      />
    </div>
  );
};
