import { Skeleton } from "@/components/ui/skeleton"

const AIBoxSkeleton = () => {
  return (
    <div className="flex items-start gap-4">
      {/* Radio button skeleton */}
      <div className="mt-6 shrink-0">
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>

      {/* Main content */}
      <div className="relative border-2 border-teal-700/30 rounded-lg p-6 w-[280px] min-h-[240px] shadow-sm bg-white flex flex-col justify-between">
        <div className="flex items-center justify-between w-full mb-4">
          {/* Logo skeleton */}
          <Skeleton className="h-[50px] w-[50px] rounded-md" />

          {/* Key button skeleton */}
          <div className="w-10 h-10 bg-sky-500/30 rounded-full flex items-center justify-center overflow-hidden shrink-0 p-0">
            <Skeleton className="h-[22px] w-[22px] rounded-full" />
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 -ml-1 flex-grow">
          {/* Provider name skeleton */}
          <Skeleton className="h-8 w-[180px] rounded-md" />

          {/* Text skeleton */}
          <Skeleton className="h-4 w-[220px] rounded-md" />
          <Skeleton className="h-4 w-[160px] rounded-md mt-1" />
        </div>

        <div className="mt-5 w-full">
          {/* Dropdown skeleton */}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}

export default AIBoxSkeleton
