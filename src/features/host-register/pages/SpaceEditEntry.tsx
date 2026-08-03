import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@/shared/components/Button";
import { useRegisterStore } from "@/store/registerStore";
import { getSpaceDetail } from "@/features/guest-explore/api/space_api";
import { toRegisterForm } from "@/features/host-register/utils/to_register_form";

// 공간 수정 진입점: spaceId로 서버에서 기존 값을 받아 수정 모드로 등록폼에 보낸다.
export const SpaceEditEntry = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const setValues = useRegisterStore((s) => s.setValues);
  const setEdit = useRegisterStore((s) => s.setEdit);
  const reset = useRegisterStore((s) => s.reset);
  const [error, setError] = useState("");

  useEffect(() => {
    // useParams는 문자열을 주므로 숫자로 바꾸고, 이상한 값이면 조회하지 않는다
    const id = Number(spaceId);
    if (!Number.isInteger(id) || id <= 0) {
      navigate("/host/spaces", { replace: true });
      return;
    }

    // 응답이 늦게 온 사이 사용자가 다른 화면으로 갔으면 반영하지 않는다
    let ignore = false;

    getSpaceDetail(id)
      .then((detail) => {
        if (ignore) return;

        // 남의 공간은 수정할 수 없다 (서버도 PATCH에서 막지만 미리 끊는다)
        if (!detail.isMine) {
          setError("내가 등록한 공간만 수정할 수 있습니다");
          return;
        }

        reset(); // 이전 등록/수정에서 남은 값 제거
        setValues(toRegisterForm(detail)); // 서버 값을 폼 형식으로 채우기
        setEdit(true, detail.spaceId); // 수정 모드 ON + 대상 id 보관
        navigate("/host/register", { replace: true });
      })
      .catch((err: unknown) => {
        if (ignore) return;
        // 에러 객체 전체를 찍으면 요청 정보가 노출될 수 있어 메시지만 남긴다
        const message = err instanceof Error ? err.message : "알 수 없는 오류";
        console.error("공간 조회 실패:", message);
        setError(
          (err as { status?: number }).status === 404
            ? "존재하지 않거나 삭제된 공간입니다"
            : "공간 정보를 불러오지 못했습니다",
        );
      });

    return () => {
      ignore = true;
    };
  }, [spaceId, navigate, reset, setValues, setEdit]);

  if (error) {
    return (
      <div className="bg-tag-bg mx-auto mt-20 flex h-[224px] w-full max-w-[794px] flex-col items-center justify-center gap-4 rounded-xl">
        <p className="text-text-primary text-xl font-medium">{error}</p>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/host/spaces", { replace: true })}
        >
          내 공간으로
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-tag-bg mx-auto mt-20 flex h-[224px] w-full max-w-[794px] items-center justify-center rounded-xl">
      <p className="text-text-primary text-xl font-medium">불러오는 중...</p>
    </div>
  );
};
