"use client";

import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

import Button from "@/components/common/button";
import Social from "@/components/common/social";
import LinkedInIcon from "@/components/icons/linkedin";
import GithubIcon from "@/components/icons/github";
import InstagramIcon from "@/components/icons/instagram";
import photoProfile from "@/assets/images/1000067811.jpg";
import BottomLeftArrowIcon from "@/components/icons/BottomLeftArrowIcon";

const Hero = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const handleSocialClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="px-4 md:px-8">
      <div className="flex justify-start pl-[4rem]">
        <h1 className="text-[3.5rem] sm:text-[8rem] lg:text-[11rem] font-bold font-lauren-thompson uppercase mb-[-2rem] sm:mb-[-6rem] sm:mt-[-4rem]">
          Based
        </h1>
      </div>
      <div className="flex justify-end">
        <h1 className="text-[3.5rem] sm:text-[8rem] lg:text-[11rem] font-bold font-lauren-thompson uppercase mb-[-2rem] sm:mb-[-6rem]">
          Software
        </h1>
      </div>
      <div className="flex justify-start">
        <h1 className="text-[3.5rem] sm:text-[8rem] lg:text-[11rem] font-bold font-lauren-thompson uppercase">
          Engineer
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 flex gap-4">
        <div className="md:col-span-1 flex gap-4 items-baseline justify-center md:justify-start p-2">
          <Social
            iconCustom={LinkedInIcon}
            size="sm"
            color={`${isDarkMode ? "white" : "black"}`}
            onClick={() =>
              handleSocialClick("https://www.linkedin.com/in/jaffarjjati")
            }
          />
          <Social
            iconCustom={GithubIcon}
            size="sm"
            color={`${isDarkMode ? "white" : "black"}`}
            onClick={() => handleSocialClick("https://github.com/jaffarjjati")}
          />
          <Social
            iconCustom={InstagramIcon}
            size="sm"
            color={`${isDarkMode ? "white" : "black"}`}
            onClick={() =>
              handleSocialClick("https://instagram.com/jaffarjjati")
            }
          />
        </div>
        <div className="md:col-span-1 p-2 relative">
          <Image
            src={photoProfile}
            alt="Description of the image"
            width={100}
            height={100}
            layout="responsive"
            className="pt-4"
          />
        </div>
        <div className="md:col-span-1 flex justify-center md:justify-end p-2">
          <div>
            <Button
              color={`${isDarkMode ? "white" : "black"}`}
              onClick={() => console.log("Icon Only")}
            >
              let&apos;s the journey start
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
