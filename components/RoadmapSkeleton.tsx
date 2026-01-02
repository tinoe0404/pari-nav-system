// components/RoadmapSkeleton.tsx
export default function RoadmapSkeleton() {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 p-6 bg-gray-100 rounded-2xl">
            <div className="w-16 h-16 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-300 rounded w-1/3" />
              <div className="h-4 bg-gray-300 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }