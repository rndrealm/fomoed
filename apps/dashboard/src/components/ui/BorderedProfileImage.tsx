import React from "react";

export function BorderedProfileImage() {
    // Hardcoding premium to true as requested
    const premium = true;

    return (
        <div
            id="profile-img-container"
            className="bg-[#221F1D] aspect-square grid place-items-center rounded-[15%] overflow-hidden border border-transparent relative"
            style={{
                background: premium
                    ? "linear-gradient(#201e1e, #201e1e) padding-box, linear-gradient(90deg, #ff3b10 0%, #f3c111 71.5%) border-box"
                    : undefined,
            }}
        >
            <img src="/deprecated/indicator-meme-5.png" className="w-[65%]" alt="Arrow right" />

            {premium && (
                <>
                    <img
                        className="absolute left-[2.5%] bottom-[2.5%] w-[20%] aspect-square z-10"
                        src="/icons/star.svg"
                        alt=""
                    />
                    <div
                        className="absolute left-0 bottom-0 rounded-tr-[50%] bg-no-repeat bg-center bg-cover w-[26%] h-[26%] aspect-square"
                        style={{
                            background: "linear-gradient(90deg, #ff3b10 0%, #f3c111 71.5%)",
                        }}
                    />
                </>
            )}
        </div>
    );
}

export default BorderedProfileImage;
