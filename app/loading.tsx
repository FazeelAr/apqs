export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="relative flex items-center justify-center">
        {/* Animated outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        {/* Inner pulse */}
        <div className="absolute w-8 h-8 rounded-full bg-accent/20 animate-pulse" />
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground animate-pulse">
        Loading APQS Circuit...
      </p>
    </div>
  );
}
