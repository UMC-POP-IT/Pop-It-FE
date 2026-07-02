import logoIcon from "@/assets/icons/logo_icon.svg";
import logoText from "@/assets/icons/logo_text.svg";

type LogoVariant = "header" | "footer" | "login";

interface LogoProps {
  variant: LogoVariant;
}

const config: Record<
  LogoVariant,
  {
    showIcon: boolean;
    iconSize: number;
    textHeight: number;
    direction: string;
    gap: string;
  }
> = {
  header: {
    showIcon: false,
    iconSize: 0,
    textHeight: 20,
    direction: "flex-row",
    gap: "gap-0",
  },
  footer: {
    showIcon: true,
    iconSize: 24,
    textHeight: 20,
    direction: "flex-row",
    gap: "gap-2",
  },
  login: {
    showIcon: true,
    iconSize: 48,
    textHeight: 36,
    direction: "flex-col",
    gap: "gap-3",
  },
};

const Logo = ({ variant }: LogoProps) => {
  const { showIcon, iconSize, textHeight, direction, gap } = config[variant];

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
        height={textHeight}
        alt="POP-IT"
      />
    </div>
  );
};

export default Logo;
