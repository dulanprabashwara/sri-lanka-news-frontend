interface ErrorStateProps {
  title?: string;
  message: string;
}

export function ErrorState({
  title = "Unable to load news",
  message,
}: ErrorStateProps) {
  return (
    <div className="state-panel border-red-200 bg-red-50" role="alert">
      <h2 className="text-lg font-bold text-red-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-red-800">{message}</p>
    </div>
  );
}
