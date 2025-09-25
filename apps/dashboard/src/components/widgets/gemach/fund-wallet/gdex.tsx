import React, { Fragment, useEffect } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { useWriteContract } from "wagmi";
import { Formik } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import dashboard from "@/lib/assets/dashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorMsg } from "@/components/auth/text-input";
import { Arbitrum, Learn } from "@/components/icons/icons";
import { useReadGemachBalance } from "@/services/queries/gemach";
import { useSupabaseAuth } from "@/components/providers";
import { getFromLocalStorage } from "@/lib/utils";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";

const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

const erc20ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
];

const validationSchema = Yup.object().shape({
  amount: Yup.number().min(0.01, "Amount must be greater than 0").required("Please enter amount"),
});

const initialValues = {
  amount: 0,
};

type InitialValues = ReturnType<() => typeof initialValues>;

interface IProps {
  handleClose: () => void;
}

export function Gdex(props: IProps) {
  const { handleClose } = props;
  const { writeContract, isPending, error, isError, isSuccess } = useWriteContract();
  const { session } = useSupabaseAuth();

  const queryClient = useQueryClient();

  const { data: balanceData } = useReadGemachBalance(session?.access_token);

  const onSubmit = (_values: InitialValues) => {
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20ABI,
      functionName: "transfer",
      args: [
        "0x7d688d8b3b7db1571bf9319467d3082aeeb18284",
        parseUnits(_values.amount.toString(), 6), // USDC has 6 decimals
      ],
      gas: BigInt(200000),
    });
  };

  useEffect(() => {
    if (isError) {
      console.log(error);
      toast.error((error as any)?.shortMessage || "Something went wrong. Please try again.");
    }
    if (isSuccess) {
      toast.success("Funds sent successfully");

      queryClient.invalidateQueries({ queryKey: ["read-copy-trade-list"] });
      queryClient.invalidateQueries({ queryKey: ["gemach-balance"] });
      queryClient.invalidateQueries({ queryKey: ["read-gemach-user"] });

      handleClose();
    }
  }, [isError, error, isSuccess, handleClose, queryClient]);

  const handleCopyAddress = async () => {
    const gdexAddress = getFromLocalStorage(LOCAL_STORAGE_KEYS.GEMACH_USER_DATA)?.address || "";
    await navigator.clipboard.writeText(gdexAddress);
    toast("Copied!!!");
  };

  return (
    <Fragment>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        // validateOnBlur={false}
        // validateOnMount={false}
        // validateOnChange={false}
      >
        {(props) => {
          const { values, handleChange, handleBlur, handleSubmit } = props;
          return (
            <form onSubmit={handleSubmit} className="w-full h-full block">
              <div className="flex flex-col max-w-[460px] mx-auto w-full h-full gap-6 justify-center">
                <div className="flex flex-col w-full">
                  <div className="flex flex-col bg-[#0C0C0C] border border-[#181818] rounded-[20px] overflow-hidden w-full">
                    <div className="flex justify-between items-center py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-[30px] h-[30px] rounded-full relative">
                          <Image
                            src={dashboard.gemachLogo}
                            alt="GEMACH Logo"
                            className="w-full h-full object-cover rounded-full"
                          />
                          <div className="w-[16px] h-[16px] rounded-full overflow-hidden absolute bottom-0 right-0">
                            <Image src={dashboard.usdc} alt="usdc Icon" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div className="flex flex-col justify-between">
                          <h4 className="text-white text-xs leading-[16px] tracking-[-0.4%]">GDEX Balance</h4>

                          <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%]">
                            {balanceData?.gdexBalance?.toFixed(2) || 0.0} USDC
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="text-white font-semibold text-xs leading-[16px] tracking-[-0.4%] bg-[#141414] px-2 py-[6px] rounded-[28px]"
                        onClick={handleCopyAddress}
                      >
                        Copy address
                      </button>
                    </div>
                    <div className="h-[1px] bg-[#181818]"></div>
                    <div className="flex flex-col py-3 px-4">
                      <div className="">
                        <Input
                          className="h-[30px] w-full border-none outline-none text-[#D7D7D7] !text-2xl tracking-[-0.4%] leading-[28px] p-0 focus-visible:ring-0"
                          type="number"
                          value={values.amount}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          name="amount"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-[16px] h-[16px] flex justify-center items-center rounded-full bg-[#232323]">
                          <p className="text-[#A6AEB2] text-[10px] leading-[10px] tracking-[-0.4%] font-medium">~</p>
                        </div>

                        <p className="text-[#A6AEB2] text-[10px] leading-[14px] tracking-[-0.4%] font-medium">
                          ${values?.amount ? values?.amount?.toFixed(2) : "0.00"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ErrorMsg name="amount" className="text-[10px] tracking-[-0.4%]" />
                </div>

                <Button
                  type="submit"
                  className="bg-[#406AC5] hover:bg-[#406AC5] text-white font-semibold text-xs leading-[16px] tracking-[-0.4%] p-3 rounded-[28px] w-full"
                  isLoading={isPending}
                >
                  Deposit USDC
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
      <div className="flex justify-between items-center w-full gap-2">
        <div className="w-[26px] h-[26px] invisible"></div>
        <div className="flex items-center gap-2 rounded-[40px] border border-[#181818] px-[10px] py-[5px]">
          <div className="w-[16px] h-[16px]">
            <Arbitrum />
          </div>
          <p className="text-[#A6AEB2] text-[10px] leading-[16px] font-medium">
            All transactions and Gas fees are on the ARB chain
          </p>
        </div>
        <div className="w-[26px] h-[26px] flex items-center justify-center">
          <Learn />
        </div>
      </div>
    </Fragment>
  );
}
