interface AuthenticationProps {
  onIsAuthenticated: (v: boolean) => void;
}

const Authentication = ({ onIsAuthenticated }: AuthenticationProps) => {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-text-primary text-xl font-bold">통합 본인 인증</span>
      <div className="border-border flex items-center justify-between rounded-md border px-4 py-4">
        <div className="flex gap-3">
          {/* 네이버 */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#03C75A]">
            <span className="text-base font-bold text-white">N</span>
          </div>
          {/* 카카오 */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEE500]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#363636" aria-hidden="true">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.79 1.84 5.25 4.6 6.68-.2.75-.73 2.7-.83 3.12-.13.52.19.51.4.37.17-.11 2.66-1.8 3.74-2.53.68.1 1.38.15 2.09.15 5.52 0 10-3.58 10-8s-4.48-8-10-8z" />
            </svg>
          </div>
          {/* PASS */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#004EA2]">
            <span className="text-[10px] font-bold text-white">PASS</span>
          </div>
        </div>
        <button
          type="button"
          className="text-text-primary text-sm font-medium underline underline-offset-2"
          onClick={() => onIsAuthenticated(true)}
        >
          간편인증 하기
        </button>
      </div>
    </div>
  );
};

export default Authentication;
