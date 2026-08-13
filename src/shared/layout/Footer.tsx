import { Fragment } from "react";
import { useLocation } from "react-router-dom";
import Logo from "@/shared/components/Logo";
import { isHostRegisterPath } from "@/shared/constants/routes";

const FOOTER_LINKS = [
  {
    label: "이용약관",
    href: "https://giant-situation-2ce.notion.site/3a47ff832aa380298623fb2bc0bd0e27",
  },
  {
    label: "개인정보처리방침",
    href: "https://giant-situation-2ce.notion.site/3a47ff832aa3803c9439c22026742566",
  },
  {
    label: "운영정책",
    href: "https://giant-situation-2ce.notion.site/3a47ff832aa380f99950de6e2b2c8606",
  },
  {
    label: "호스트 이용약관",
    href: "https://giant-situation-2ce.notion.site/3a47ff832aa3801b9210cca3e675ae33",
  },
  {
    label: "취소 및 환불 정책",
    href: "https://giant-situation-2ce.notion.site/3a47ff832aa380fa8f77ddffee35c6ae",
  },
];

const Footer = () => {
  // pb-[70px]은 모바일 전용 하단 탭바(MobileBottomNav, fixed·md:hidden)가 푸터 내용을
  // 가리지 않도록 비워두는 자리다. 호스트 등록 흐름에서는 그 탭바를 렌더하지 않으므로
  // (#302) 여백만 남으면 767 이하에서 저작권 문구 아래에 빈 70px 띠가 생긴다.
  //
  // 판정을 MainLayout에서 한 번 하고 prop으로 내리지 않는 이유: MainLayout이 location을
  // 구독하면 주소가 바뀔 때마다 Header·Footer·탭바·모달이 전부 같이 리렌더된다.
  // ExplorePage는 필터를 바꿀 때마다 setSearchParams로 주소를 갱신하므로 그 비용이
  // 매번 든다. 구독을 실제로 쓰는 잎(여기)에 두면 리렌더도 여기서 끝난다.
  const { pathname } = useLocation();
  const hasBottomNav = !isHostRegisterPath(pathname);

  return (
    <footer
      className={`bg-bg-footer mt-20 min-h-[302px] w-full ${hasBottomNav ? "pb-[70px] md:pb-0" : ""}`}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-start gap-5 px-4 py-15 md:flex-row md:justify-between md:gap-8 md:px-6">
        <div className="flex flex-col gap-5">
          <p className="text-text-tag text-sm font-medium">주식회사 팝잇</p>
          <div className="text-text-tag flex flex-col gap-1 text-xs leading-[1.5] tracking-[-0.1px]">
            <p>
              대표 : 홍태경 | 사업자등록번호 : 612-87-59302 | 통신판매업
              신고번호 : 2026-서울마포-0815
            </p>
            <p>주소 : 서울특별시 마포구 와우산로 482, 4층</p>
            <p>이메일 : contact@pop-it.kr | 고객센터 : 070-7542-9180</p>
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

        <div className="order-first flex-shrink-0 min-[768px]:order-none">
          <Logo variant="footer" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
