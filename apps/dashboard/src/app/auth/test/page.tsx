"use client";

import { Button } from "@/components/ui/button";
import { useRegisterUser } from "@/services/queries/auth";
import { Loader2 } from "lucide-react";
import React from "react";

const Home = () => {
  const { mutate, isPending } = useRegisterUser();
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <Button
        onClick={() => {
          mutate({
            email: "deji@mailinator.com",
            password: "password",
            username: "rajioladeji",
          });
        }}
      >
        {isPending ? <Loader2 className="animate-spin" /> : null}
        Please wait
      </Button>
    </div>
  );
};

export default Home;
