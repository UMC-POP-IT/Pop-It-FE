import { uploadFiles } from "@/features/host-register/api/upload_api";
import { toSpaceRequest } from "@/features/host-register/utils/to_space_request";
import {
  createSpace,
  updateSpace,
} from "@/features/host-register/api/space_api";
import StepIndicator from "@/shared/components/StepIndicator";
import Button from "@/shared/components/Button";
import iconCamera from "@/assets/icons/icon_camera.svg";
import iconInfo from "@/assets/icons/icon_info.svg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Modal from "@/shared/components/Modal";
import { useRegisterStore, type SpacePhoto } from "@/store/registerStore";
import { STEPS, GUIDE_ITEMS } from "@/features/host-register/api/mock_register";
import iconTrash from "@/assets/icons/icon_trash.svg";

/** 공간 사진 최대 장수 (스웨거 SpaceCreateReq.imageUrls maxItems) */
const MAX_PHOTOS = 10;

export const RegisterStep5 = () => {
  const isEdit = useRegisterStore((s) => s.isEdit);
  const editSpaceId = useRegisterStore((s) => s.editSpaceId);
  const navigate = useNavigate();
  const [modal, setModal] = useState<"confirm" | "success" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 진행 중 (중복 클릭 방지)
  const [submitError, setSubmitError] = useState(""); // 실패 사유 (빈 문자열이면 정상)
  const [photoNotice, setPhotoNotice] = useState(""); // 개수 제한으로 빠진 사진 안내
  const form = useRegisterStore((s) => s.form);
  const setValues = useRegisterStore((s) => s.setValues);
  const reset = useRegisterStore((s) => s.reset);

  /**
   * 최종 제출: 사진 업로드 → 서버 형식 변환 → 등록(또는 수정)
   * 서버 응답을 받은 뒤에만 성공 모달을 띄운다.
   */
  const handleSubmit = async () => {
    if (isSubmitting) return; // 중복 클릭 방지
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // ① 새로 고른 사진만 업로드한다 (수정 시 기존 사진은 이미 서버에 있음)
      const newFiles = form.photoList.flatMap((photo) =>
        photo.kind === "new" ? [photo.file] : [],
      );
      const uploadedUrls = await uploadFiles(newFiles, "SPACE_IMAGE");

      // 업로드 결과를 원래 순서대로 되돌린다 (첫 장 = 대표사진)
      let uploadedIndex = 0;
      const imageUrls = form.photoList.map((photo) =>
        photo.kind === "existing" ? photo.url : uploadedUrls[uploadedIndex++],
      );

      // ② 폼 값을 서버 형식으로 변환
      const request = toSpaceRequest(form, imageUrls);

      // ③ 등록 또는 수정
      if (isEdit) {
        // 수정인데 대상 id가 없으면 조용히 새 공간을 만들지 않고 여기서 멈춘다
        if (editSpaceId === null) {
          throw new Error(
            "수정할 공간 정보를 찾을 수 없습니다. 목록에서 다시 들어와주세요",
          );
        }
        await updateSpace(editSpaceId, request);
      } else {
        await createSpace(request);
      }

      setModal("success"); // 여기까지 왔으면 서버가 받아들인 것
    } catch (error) {
      // 에러 객체 전체를 찍으면 요청 정보가 노출될 수 있어 메시지만 남긴다
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다";
      console.error(isEdit ? "공간 수정 실패:" : "공간 등록 실패:", message);
      setSubmitError(message);
      setModal(null); // 확인 모달을 닫아 에러 문구가 보이게 한다
    } finally {
      setIsSubmitting(false);
    }
  };

  // 성공 확인 → 보관함 비우고 '내 공간'으로 이동
  const handleDone = () => {
    reset();
    navigate("/host/spaces");
  };

  return (
    <div className="mx-auto flex w-full max-w-[794px] flex-col gap-8 px-4 py-6">
      {/* 페이지 제목 (가운데) */}
      <h1 className="text-text-primary text-center text-[32px] font-bold">
        {isEdit ? "공간 수정" : "공간 등록"}
      </h1>

      {/* 상단 진행바 — 4 = 다섯 번째 단계(사진 등록, 마지막) */}
      <StepIndicator
        steps={STEPS}
        currentStep={4}
      />

      {/* 섹션: 사진 등록 */}
      <div className="flex flex-col gap-6">
        {/* 섹션 제목 + 안내문 */}
        <div className="border-border flex flex-col gap-1 border-b pb-6">
          <h2 className="text-text-primary text-[28px] font-bold">사진 등록</h2>
          <p className="text-text-primary text-[22px] font-bold">
            공간의 사진을 등록해 주세요
          </p>
          <p className="text-text-tertiary text-xl font-medium">
            최소 3장 이상의 사진을 등록해주세요. 첫 번째 사진이 대표 사진이
            됩니다.
          </p>
        </div>

        {/* 사진 업로더: 카메라 타일 + 업로드된 썸네일들 */}
        <div className="flex flex-wrap gap-[18.5px]">
          {/* 업로드 버튼 타일 (카메라 아이콘 + 매수 카운트) */}
          <label
            aria-label="사진 추가"
            className="border-divider text-text-tertiary flex size-[144px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2"
          >
            <img
              src={iconCamera}
              alt=""
              className="h-10 w-10"
            />
            {/* 업로드 매수 실시간 카운트 (챈 디자인 크기 + store의 photoList 길이) */}
            <span className="text-xl font-medium">
              {form.photoList.length}/{MAX_PHOTOS}장
            </span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                const room = Math.max(0, MAX_PHOTOS - form.photoList.length);
                const accepted = picked.slice(0, room);
                const dropped = picked.length - accepted.length;

                setValues({
                  photoList: [
                    ...form.photoList,
                    ...accepted.map((file): SpacePhoto => ({
                      kind: "new",
                      file,
                    })),
                  ],
                });
                // 넘친 만큼은 조용히 버리지 않고 몇 장이 빠졌는지 알린다
                setPhotoNotice(
                  dropped > 0
                    ? `사진은 최대 ${MAX_PHOTOS}장까지 등록할 수 있어 ${dropped}장은 추가되지 않았습니다`
                    : "",
                );
                e.target.value = ""; // 같은 파일을 다시 골라도 onChange가 뜨도록 비운다
              }}
              className="sr-only"
            />
          </label>

          {/* 업로드된 사진 썸네일 (미리보기 URL 관리는 PhotoThumbnail 내부에서) */}
          {form.photoList.map((photo, i) => (
            <PhotoThumbnail
              key={i}
              photo={photo}
              isFirst={i === 0}
              onRemove={() =>
                setValues({
                  photoList: form.photoList.filter((_, idx) => idx !== i),
                })
              }
            />
          ))}
        </div>

        {/* 개수 제한으로 빠진 사진 안내 — 나타나는 순간 스크린 리더가 읽도록 role="alert" */}
        {photoNotice && (
          <span
            role="alert"
            className="text-danger text-sm"
          >
            {photoNotice}
          </span>
        )}

        {/* 사진 촬영 가이드 박스 */}
        <div className="bg-info-bg flex flex-col gap-2 rounded-lg p-4">
          <span className="text-primary-hover flex items-center gap-1 text-xl font-bold">
            <img
              src={iconInfo}
              alt=""
              className="h-6 w-6"
            />
            사진 촬영 가이드
          </span>
          <ul className="text-text-secondary flex list-disc flex-col gap-1 ps-[30px] text-xl font-medium">
            {GUIDE_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {submitError && (
        <span
          role="alert"
          className="text-danger self-end text-sm"
        >
          {submitError}
        </span>
      )}

      {/* 이전 / 완료 버튼 (우측 정렬) */}
      <div className="flex justify-end gap-2">
        <Modal
          isOpen={modal === "confirm"}
          title={
            isEdit
              ? "변경 사항으로 수정하시겠습니까?"
              : "공간을 등록하시겠습니까?"
          }
          description={
            isEdit
              ? "저장 후에는 즉시 서비스에 반영됩니다.\n수정된 정보가 정확한지 다시 한번 확인해주세요."
              : undefined
          }
          cancelLabel="돌아가기"
          confirmLabel={
            isSubmitting
              ? isEdit
                ? "수정 중..."
                : "등록 중..."
              : isEdit
                ? "공간 수정하기"
                : "공간 등록하기"
          }
          confirmDisabled={isSubmitting}
          onCancel={() => setModal(null)}
          onConfirm={handleSubmit}
        />

        <Modal
          isOpen={modal === "success"}
          title={
            isEdit
              ? "공간이 성공적으로 수정되었습니다!"
              : "공간이 성공적으로 등록되었습니다!"
          }
          confirmLabel="확인"
          singleButton
          showCheckIcon
          onCancel={handleDone}
          onConfirm={handleDone}
        />

        <Button
          variant="secondary"
          size="nav"
          onClick={() => navigate("/host/register/step4")}
        >
          이전
        </Button>
        <Button
          variant="primary"
          size="nav"
          disabled={form.photoList.length < 3}
          onClick={() => setModal("confirm")}
        >
          완료
        </Button>
      </div>
    </div>
  );
};

// 사진 썸네일 — 미리보기 URL을 한 번만 만들고 정리(revoke)까지 관리 (메모리 누수 방지)
const PhotoThumbnail = ({
  photo,
  isFirst,
  onRemove,
}: {
  photo: SpacePhoto;
  isFirst: boolean;
  onRemove: () => void;
}) => {
  // 기존 사진은 이미 주소가 있어 첫 렌더부터 바로 보여준다 (깜빡임 방지)
  const [url, setUrl] = useState(photo.kind === "existing" ? photo.url : "");

  useEffect(() => {
    // 서버 사진은 주소를 그대로 쓰며, 정리할 임시 URL이 없다
    if (photo.kind === "existing") {
      setUrl(photo.url);
      return;
    }
    const objectUrl = URL.createObjectURL(photo.file);
    setUrl(objectUrl);
    // 뒷정리: 언마운트 / photo 변경 시 URL 해제 (메모리 누수 방지)
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="group relative size-[144px] shrink-0">
      <div className="bg-tag-bg border-divider relative h-full w-full overflow-hidden rounded-lg border-2">
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
        />

        {/* 삭제 오버레이 — hover 기기는 hover 시, 터치 기기는 항상 노출(투명 클릭 함정 방지) */}
        <button
          type="button"
          aria-label="사진 삭제"
          onClick={onRemove}
          className="absolute inset-0 flex items-center justify-center bg-black/70 transition-opacity focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
        >
          <img
            src={iconTrash}
            alt=""
            className="h-10 w-10"
          />
        </button>
      </div>

      {isFirst && (
        <span className="bg-primary-light text-primary absolute top-0 left-[79%] -translate-x-1/2 -translate-y-1/4 rounded-full px-3 py-1.5 text-xl font-medium whitespace-nowrap">
          대표사진
        </span>
      )}
    </div>
  );
};
