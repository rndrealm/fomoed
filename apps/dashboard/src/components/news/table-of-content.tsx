import React from "react";

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
  );
};

export default TableOfContent;
