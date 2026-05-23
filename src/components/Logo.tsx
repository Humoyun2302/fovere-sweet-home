import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/logo.png";

type LogoProps = {
  className?: string;
  /** Image height utility, e.g. h-10 */
  heightClass?: string;
  to?: "/" | "/login";
};

export function Logo({ className = "", heightClass = "h-10", to }: LogoProps) {
  const img = (
    <img
      src={logoImg}
      alt="Fovere Sweet Home"
      className={`${heightClass} w-auto object-contain ${className}`}
    />
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center">
        {img}
      </Link>
    );
  }

  return <div className="inline-flex items-center">{img}</div>;
}
