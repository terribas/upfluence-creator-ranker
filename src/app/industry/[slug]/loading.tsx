import { Skeleton } from '@/components/ui/skeleton'

function CreatorRowSkeleton() {
  return (
    <div className="grid grid-cols-[2rem_3rem_1fr_auto] md:grid-cols-[2rem_3rem_1fr_8rem_6rem_6rem_10rem_7rem] items-center gap-3 px-4 py-3 rounded-lg border bg-card">
      <Skeleton className="h-4 w-5 rounded" />
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="hidden md:block h-4 w-14 ml-auto" />
      <Skeleton className="hidden md:block h-4 w-12 ml-auto" />
      <Skeleton className="hidden md:block h-4 w-12 ml-auto" />
      <div className="hidden md:flex gap-1">
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="space-y-1">
        <Skeleton className="h-4 w-10 ml-auto" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Skeleton className="h-20 w-full rounded-lg" />

      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <CreatorRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
