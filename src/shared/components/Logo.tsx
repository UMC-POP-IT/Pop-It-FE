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
