import React from "react";

interface IProps {
  data: {
    id: number;
    name: string;
    slug: string;
  }[];
  active: string;
}

const TableOfContent = (props: IProps) => {
  const { data, active } = props;
  return (
    <nav className="mt-12">
      <ul className="list-none">
        {data.map((item, i) => (
          <li key={i} className="text-ideal font-semibold text-white">
            {item.name}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContent;
