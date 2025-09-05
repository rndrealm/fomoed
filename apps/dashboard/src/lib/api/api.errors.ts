import { NextResponse } from "next/server";
import { asNextResponseError } from "../utils/server.utils";

export const newInvalidPriceLookupKeyError = () =>
  NextResponse.json({ success: false, message: "Invalid Price Lookup Key" }, { status: 400 });

export const newPriceIdNotFoundError = () =>
  NextResponse.json(
    {
      success: false,
      message: "Price ID not found for the given lookup key",
    },
    { status: 404 },
  );

export const newUserAlreadyHasSubscriptionError = () =>
  NextResponse.json({
    success: false,
    message: "User already has an active subscription. User can have only a single subscription active at a time.",
  });

export const newUserDoesNotHaveActiveSubscriptionError = () =>
  NextResponse.json({ success: false, message: "User does not have an active subscription" }, { status: 400 });

export const newCannotFindCustomerError = () =>
  NextResponse.json({ success: false, message: "Cannot find customer" }, { status: 500 });

export const newNotAuthenticatedError = () =>
  NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });

export const newUserNotFoundError = () =>
  NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

export const newInvalidRequestBodyError = (detail: any) => {
  return asNextResponseError({ message: "Invalid request body", status: 400, detail });
};
