import React from "react";

interface SecondaryButtonProps {
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ disabled = false, loading = false, onClick, children }) => {
    return (
        <button
            disabled={disabled || loading}
            className={`h-full flex items-center font-paralucent-demibold justify-center text-white text-opacity-80 text-sm duration-100 max-h-[45px] px-4 py-2 rounded-[10px] bg-white/15 enabled:hover:bg-white/20 border-white/10 enabled:active:border-platform-primary enabled:hover:border-white/40 border-[0.5px] shadow-[0px_0px_0px_5px_#F5F5F51A] w-full ${
                disabled ? "opacity-60" : ""
            }`}
            onClick={onClick}
        >
            {loading ? (
                <div className="h-5 flex items-center">
                    <LoadingSpinner />
                </div>
            ) : (
                children
            )}
        </button>
    );
};

// Simple loading spinner component to replace the Svelte Circle component
const LoadingSpinner: React.FC = () => (
    <div className="animate-spin h-4 w-4 border-2 border-white/10 border-opacity-80 rounded-full border-t-transparent" />
);

export default SecondaryButton;
