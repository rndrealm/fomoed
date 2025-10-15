import React from "react";
import { Form } from "./form";
import { Overview } from "./overview";

export default function CreateOrder() {
  return (
    <div className="max-w-[210px] flex flex-col flex-1 gap-2">
      <div className="bg-[#121317] rounded-[10px] pt-2 px-3 pb-4">
        <Form />
      </div>

      <div className="bg-[#121317] rounded-[10px] p-3">
        <Overview />
      </div>
    </div>
  );
}
