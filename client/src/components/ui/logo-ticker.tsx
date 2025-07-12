import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

interface Logo {
  id: string;
  description: string;
  image: string;
  className?: string;
}

interface LogoTickerProps {
  logos: Logo[];
  direction?: "ltr" | "rtl";
  speed?: number;
  className?: string;
}

const LogoTicker = ({
  logos = [],
  direction = "ltr",
  speed = 0.5,
  className = "",
}: LogoTickerProps) => {
  // Using the embla carousel directly instead of the Carousel component
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      direction: direction
    },
    [AutoScroll({ playOnInit: true, speed: speed })]
  );

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div className="relative mx-auto flex items-center justify-center">
        <div className="w-full overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="flex-grow-0 flex-shrink-0 basis-1/4 sm:basis-1/5 md:basis-1/6 lg:basis-1/8 px-4"
              >
                <div className="mx-8 flex items-center justify-center">
                  <img
                    src={logo.image}
                    alt={logo.description}
                    className={logo.className || "h-16 w-auto"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent"></div>
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent"></div>
      </div>
    </div>
  );
};

export { LogoTicker, type Logo };