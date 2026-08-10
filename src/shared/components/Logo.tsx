import logoIcon from "@/assets/icons/logo_icon.svg";
import logoText from "@/assets/icons/logo_text.svg";

type LogoVariant = "header" | "footer" | "login" | "error";

interface LogoProps {
  variant: LogoVariant;
}

const config: Record<
  LogoVariant,
  {
    showIcon: boolean;
    iconSize: number;
    textWidth?: number;
    textHeight: number;
    direction: string;
    gap: string;
  }
> = {
  header: {
    showIcon: false,
    iconSize: 0,
    textHeight: 26,
    direction: "flex-row",
    gap: "gap-0",
  },
  footer: {
    showIcon: true,
    iconSize: 28,
    textHeight: 24,
    direction: "flex-row",
    gap: "gap-4",
  },
  login: {
    showIcon: true,
    iconSize: 42,
    textWidth: 189,
    textHeight: 36,
    direction: "flex-row",
    gap: "gap-[21px]",
  },
  error: {
    showIcon: false,
    iconSize: 0,
    textWidth: 108,
    textHeight: 20.8,
    direction: "flex-row",
    gap: "gap-0",
  },
};

const Logo = ({ variant }: LogoProps) => {
  // 헤더: 모바일(~767)·태블릿(768~1023)에서는 좁은 폭에 맞춰 아이콘만(크기만 다름), 데스크탑(1024~)은 텍스트 로고
  if (variant === "header") {
    return (
      <div className="flex items-center">
        <img
          src={logoIcon}
          width={32}
          height={32}
          alt="POP-IT"
          className="block md:hidden"
        />
        <img
          src={logoIcon}
          width={40}
          height={40}
          alt="POP-IT"
          className="hidden md:block lg:hidden"
        />
        <img
          src={logoText}
          height={26}
          alt="POP-IT"
          className="hidden lg:block"
        />
      </div>
    );
  }

  // 푸터: 모바일(~767)에서는 데스크탑 대비 0.6배로 축소된 로고(Figma 실측: 120x30 vs 200x50)
  if (variant === "footer") {
    return (
      <div className="flex items-center gap-2.5 min-[768px]:gap-4">
        <img
          src={logoIcon}
          alt=""
          aria-hidden="true"
          className="h-[17px] w-[17px] min-[768px]:h-[28px] min-[768px]:w-[28px]"
        />
        <img
          src={logoText}
          alt="POP-IT"
          className="h-[14px] w-auto min-[768px]:h-[24px]"
        />
      </div>
    );
  }

  const { showIcon, iconSize, textWidth, textHeight, direction, gap } = config[variant];

  return (
    <div className={`flex items-center ${direction} ${gap}`}>
      {showIcon && (
        <img
          src={logoIcon}
          width={iconSize}
          height={iconSize}
          alt=""
          aria-hidden="true"
        />
      )}
      <img
        src={logoText}
        width={textWidth}
        height={textHeight}
        alt="POP-IT"
      />
    </div>
  );
};

export default Logo;
