import ErrorComponent from "@/components/shared/error-component";

const content = {
    error: "404",
    message: "Oops! Nothing here.",
    message2: "Looks like the page you're trying to view does not exist",
    label: "Go Back Home",
};

export default function NotFound() {
    return <ErrorComponent content={content} />;
}