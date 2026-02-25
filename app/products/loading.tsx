// Shared skeleton primitives
const Bar = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
    <div className={`${w} ${h} animate-pulse rounded-xl bg-slate-200`} />
);

export default function ProductsLoading() {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl bg-slate-200 animate-pulse h-20 w-full" />
            <div className="flex gap-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-slate-200" />)}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                        <div className="h-44 w-full animate-pulse rounded-xl bg-slate-200" />
                        <Bar w="w-3/4" h="h-5" />
                        <Bar w="w-1/3" h="h-4" />
                        <Bar w="w-full" h="h-3" />
                        <Bar w="w-2/3" h="h-3" />
                        <div className="flex justify-between items-center mt-2">
                            <Bar w="w-16" h="h-4" />
                            <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-200" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
