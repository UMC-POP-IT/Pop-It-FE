import { useNavigate } from "react-router-dom";
import Logo from "@/shared/components/Logo";
import Button from "@/shared/components/Button";
import errorIllustration from "@/assets/images/error_illustration.png";

export const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="flex flex-col items-center gap-10 md:flex-row md:gap-20">
        {/* Figma 원본 이미지 크기(279x273) 그대로 사용, 좁은 화면에서는 비율 유지하며 축소 */}
        <div className="shrink-0">
          <img
            src={errorIllustration}
            alt=""
            width={279}
            height={273}
            className="h-auto w-[220px] sm:w-[279px]"
          />
        </div>

        <div className="flex flex-col items-center gap-10 text-center md:items-start md:gap-20 md:text-left">
          <div className="flex flex-col items-center gap-5 md:items-start">
            <Logo variant="error" />
            <div className="flex flex-col items-center gap-2 md:items-start">
              <h1 className="text-text-primary text-[32px] font-bold">일시적인 오류가 발생했습니다.</h1>
              <p className="text-text-tertiary text-xl font-medium">
                잠시 후 다시 시도하거나 이전 페이지로 돌아가 주세요.
              </p>
            </div>
          </div>

          <Button variant="primary" size="nav" className="font-bold!" onClick={() => navigate("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
