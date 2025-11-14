import React, { useRef } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { SubmitButton, TextInput } from "../auth";
import { Close, Enter, UploadToCloud } from "../icons/icons";
import { RenderIf } from "../shared";
import { File } from "lucide-react";
import { ErrorMsg } from "../auth/text-input";

const truncateFilename = (filename: string, maxLength: number = 30) => {
  if (filename.length <= maxLength) return filename;

  const extension = filename.split(".").pop();
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension!.length - 4);

  return `${truncatedName}...${extension}`;
};

const validationSchema = Yup.object().shape({
  pnlProof: Yup.mixed()
    .required("Please upload a PNL proof")
    .test("fileSize", "File size must be less than 10MB", (value) => {
      if (!value) return false;
      return (value as File).size <= 10 * 1024 * 1024;
    })
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return false;
      return (value as File).type.startsWith("image/");
    }),
});

const initialValues = {
  pnlProof: null as File | null,
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  handleSubmit: (values: InitialValues) => void;
  initialValues: InitialValues;
  isLoading?: boolean;
}

export default function Step7(props: IProps) {
  const { handleSubmit, initialValues, isLoading } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const onSubmit = (_values: InitialValues) => {
    handleSubmit(_values);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      // validateOnBlur={false}
      // validateOnMount={false}
      // validateOnChange={false}
    >
      {(props) => {
        const { handleSubmit, setFieldValue, values } = props;

        const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (file) {
            setFieldValue("pnlProof", file);
          }
        };

        return (
          <form onSubmit={handleSubmit} className="">
            <div className="flex flex-col gap-9">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="w-full p-4 flex flex-col gap-5 border border-dashed border-[rgba(255,255,255,0.2)] rounded-xl">
                    <RenderIf condition={!values?.pnlProof}>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-center">
                          <UploadToCloud />
                        </div>

                        <div className="flex flex-col gap-1">
                          <p className="text-white text-sm leading-[20px] tracking-[-0.6%] text-center">
                            Upload Proof of PNL
                          </p>
                          <p className="text-white text-xs leading-[16px] opacity-50 text-center">
                            Attach image up to 10 MB size
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <button
                          type="button"
                          className="px-2 py-[6px] border border-[rgba(255,255,255,0.2)] rounded-lg text-xs leading-[16px] tracking-[-0.4%] text-[rgba(255,255,255,0.5)]"
                          onClick={() => {
                            inputRef.current?.click();
                          }}
                        >
                          Browse File
                        </button>
                      </div>
                    </RenderIf>
                    <RenderIf condition={!!values?.pnlProof}>
                      <div className="flex flex-col gap-6">
                        <div className="flex gap-3 items-center justify-between">
                          <div className="w-[40px] h-[40px] flex items-center justify-center">
                            <File color="#fff" size={30} />
                          </div>
                          <div className="flex-1 flex flex-col gap-1">
                            <p className="text-white text-sm leading-[20px] tracking-[-0.6%] truncate break-all">
                              {truncateFilename(values?.pnlProof?.name || "", 30)}
                            </p>
                            <p className="text-[#99A0AE] text-xs leading-[16px]">
                              {((values?.pnlProof?.size || 0) / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (inputRef.current) {
                                inputRef.current.value = "";
                              }
                              setFieldValue("pnlProof", null);
                            }}
                          >
                            <Close />
                          </button>
                        </div>

                        <div className="h-[6px]"></div>
                      </div>
                    </RenderIf>
                  </div>

                  <ErrorMsg name="pnlProof" />
                </div>
              </div>

              <input ref={inputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

              <div className="">
                <SubmitButton
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="text-xs font-medium leading-[16px] tracking-[-0.4%] text-[#000] rounded-lg"
                >
                  Finish!
                </SubmitButton>
              </div>
            </div>
          </form>
        );
      }}
    </Formik>
  );
}
