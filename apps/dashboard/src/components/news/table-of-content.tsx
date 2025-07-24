import React from "react";
import { motion } from "motion/react";

interface IProps {
  data: {
    id: number;
    name: string;
    slug: string;
    sectionId: string;
    yOffset: number;
  }[];
  active: string;
  currentIndex: number;
}

const TableOfContent = (props: IProps) => {
  const { data, active, currentIndex } = props;

  const handleScroll = (item: IProps["data"][0]) => {
    const section = document.getElementById(item.sectionId);

    if (section) {
      const yOffset = -item.yOffset;
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        transform: "translateY(-50%)",
      }}
      className="sticky top-[150px] hidden gap-3 self-start lg:flex"
    >
      {/* <div className="left:1/2 fixed top-[56px] left-[350px] hidden flex-row gap-3 2xl:top-[114px] 2xl:left-[120px] 2xl:flex"> */}
      <div className="relative top-14 flex w-4.5 flex-col gap-1">
        {/* <motion.div
          animate={{ width: currentIndex === 0 ? "16px" : "9px" }}
          className="h-[0px] w-[16px] border-[1px] border-[#FFF]"
        ></motion.div> */}

        {data.map((item, index) => {
          if (index === data.length - 1)
            return (
              <motion.div
                key={index}
                initial={{ width: currentIndex === index ? "16px" : "9px" }}
                style={{ willChange: "width" }}
                animate={{ width: currentIndex === index ? "16px" : "9px" }}
                transition={{ duration: 0.5, delay: 0.125, ease: [0.4, 0.0, 0.2, 1] }}
                className="h-[0px] w-[16px] border-[1px] border-[#FFF]"
              ></motion.div>
            );

          return (
            <div key={index} className="flex flex-col gap-[3px]">
              <motion.div
                initial={{ width: currentIndex === index ? "16px" : "9px" }}
                style={{ willChange: "width" }}
                animate={{ width: currentIndex === index ? "16px" : "9px" }}
                transition={{ duration: 0.5, delay: 0.125, ease: [0.4, 0.0, 0.2, 1] }}
                className="h-[0px] w-[16px] border-[1px] border-[#FFF]"
              ></motion.div>
              <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
              <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
              <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
              <div className="h-[0px] w-[6px] border-[1px] border-[#333333]"></div>
            </div>
          );
        })}
      </div>

      <nav className="mt-12">
        <ul className="flex list-none flex-col gap-[5px]">
          {data.map((item, index) => (
            <li
              style={{ color: currentIndex === index ? "#FFF" : "#A4A4A4" }}
              key={index}
              onClick={() => handleScroll(item)}
              className="text-ideal cursor-pointer font-semibold text-white"
            >
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default TableOfContent;
