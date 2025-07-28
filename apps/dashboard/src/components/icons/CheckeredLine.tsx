import React from "react";

export default function CheckeredLine(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg width="312" height="2" viewBox="0 0 312 2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 1H312" stroke={props.color} strokeDasharray="4 4" />
        </svg>
    )
}
