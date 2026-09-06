import { Button } from "./button";
import { ArrowRight} from "lucide-react";

interface BannerProps {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  overlay?: boolean;
}

export function Banner({
  title,
  subtitle,
  description,
  buttonText,
  backgroundImage,
  overlay = true,
}: BannerProps) {
  return (
    <div className="relative h-96 md:h-[500px] overflow-hidden rounded-lg">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {overlay && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <p className="text-blue-400 font-semibold text-sm uppercase tracking-wide mb-2">
              {subtitle}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">{description}</p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoryBanner({
  title,
  image,
}: {
  title: string;
  image: string;
  link: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-muted aspect-square">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
      </div>
    </div>
  );
}
