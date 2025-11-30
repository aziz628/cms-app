
/**
 * A reusable loading spinner component with customizable size.
 */
export default function LoadingSpinner({ size = "big" }) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${size=="big" ? "h-12 w-12" : "h-8 w-8"}`}></div>
    </div>
  );
}