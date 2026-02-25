const Bar = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
    <div className={`${w} ${h} animate-pulse rounded-xl bg-slate-200`} />
);

export default function OrdersLoading() {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl bg-slate-200 animate-pulse h-20 w-full" />
            <div className="grid gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                        <div className="flex justify-between">
                            <Bar w="w-1/3" h="h-4" />
                            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
                        </div>
                        <Bar w="w-1/4" h="h-6" />
                        <Bar w="w-1/2" h="h-3" />
                    </div>
                ))}
            </div>
        </div>
    );
}
