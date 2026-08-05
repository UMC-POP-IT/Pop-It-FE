import { Fragment } from "react";
import Logo from "@/shared/components/Logo";

const FOOTER_LINKS = [
  { label: "이용약관", href: "https://giant-situation-2ce.notion.site/3a47ff832aa380298623fb2bc0bd0e27" },
  { label: "개인정보처리방침", href: "https://giant-situation-2ce.notion.site/3a47ff832aa3803c9439c22026742566" },
  { label: "운영정책", href: "https://giant-situation-2ce.notion.site/3a47ff832aa380f99950de6e2b2c8606" },
  { label: "호스트 이용약관", href: "https://giant-situation-2ce.notion.site/3a47ff832aa3801b9210cca3e675ae33" },
  { label: "취소 및 환불 정책", href: "https://giant-situation-2ce.notion.site/3a47ff832aa380fa8f77ddffee35c6ae" },
];

const Footer = () => (
  <footer className="bg-bg-footer mt-20 min-h-[302px] w-full">
    <div className="mx-auto flex max-w-screen-xl items-start justify-between gap-8 px-30 py-15">
      <div className="flex flex-col gap-5">
        <p className="text-text-tag text-sm font-medium">주식회사 팝잇</p>
        <div className="text-text-tag flex flex-col gap-1 text-xs tracking-[-0.1px] leading-[1.5]">
          <p>대표 : OOO | 사업자등록번호 : 000-00-00000 | 통신판매업 신고</p>
          <p>번호 : 2026-서울OO-0000 | 주소 : 서울특별시 OO구 OO로 00, 0층</p>
          <p>이메일 : contact@pop-it.kr | 고객센터 : 0000-0000</p>
          <p>운영시간 : 평일 10:00 ~ 18:00, 주말 및 공휴일 휴무</p>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {FOOTER_LINKS.map(({ label, href }, i) => (
              <Fragment key={label}>
                {i > 0 && <span className="bg-divider h-2.5 w-px" />}
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-tag hover:text-primary text-xs font-bold tracking-[-0.1px] transition-colors"
                >
                  {label}
                </a>
              </Fragment>
            ))}
          </div>
          <p className="text-text-tag text-xs tracking-[-0.1px]">
            팝잇은 통신판매중개자로서 공간 제공자와 이용자 간 거래를 연결하는
            플랫폼입니다.
            <br />
            공간의 예약, 이용, 환불 및 계약 조건은 각 공간 상세 안내와 팝잇
            이용정책에 따릅니다.
          </p>
        </div>
        <p className="text-text-tag text-[10px] font-bold tracking-[-0.08px]">
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
