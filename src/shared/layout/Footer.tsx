import { Link } from "react-router-dom";
import Logo from "@/shared/components/Logo";

const FOOTER_LINKS = [
  "이용약관",
  "개인정보처리방침",
  "공지사항",
  "호스트 이용약관",
  "취소 및 환불 정책",
];

const Footer = () => (
  <footer className="bg-bg-footer border-border mt-20 min-h-[302px] w-full border-t">
    <div className="mx-auto flex max-w-screen-xl items-start justify-between gap-8 px-6 py-10">
      <div className="flex flex-col gap-3">
        <p className="text-text-primary text-xs font-semibold">주식회사 팝잇</p>
        <div className="text-text-secondary text-xs leading-5">
          <p>대표: OOO | 사업자등록번호: 000-00-00000 | 통신판매업 신고</p>
          <p>번호: 2026-서울OO-0000 | 주소: 서울특별시 OO구 OO로 00, 0층</p>
          <p>이메일: contact@pop-it.kr | 고객센터: 0000-0000</p>
          <p>운영시간: 평일 10:00 ~ 18:00, 주말 및 공휴일 휴무</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item}
              to="#"
              className="text-text-secondary hover:text-primary text-xs transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
        <p className="text-text-secondary text-xs leading-5">
          팝잇은 통신판매중개자로서 공간 제공자와 이용자 간 거래를 연결하는
          플랫폼입니다.
          <br />
          공간의 예약, 이용, 환불 및 계약 조건은 각 공간 상세 안내와 팝잇
          이용정책에 따릅니다.
        </p>
        <p className="text-text-disabled text-xs">
          © POP-IT Corp. All rights reserved.
        </p>
      </div>

      <div className="flex-shrink-0">
        <Logo variant="footer" />
      </div>
    </div>
  </footer>
);

export default Footer;
