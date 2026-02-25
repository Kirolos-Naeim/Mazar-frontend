const Bar = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
    <div className={`${w} ${h} animate-pulse rounded-xl bg-slate-200`} />
);

export default function AdminLoading() {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl bg-slate-200 animate-pulse h-20 w-full" />
            <div className="flex gap-2">
                <div className="h-9 w-32 animate-pulse rounded-xl bg-slate-200" />
            </div>
            <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                        <div className="flex justify-between">
                            <Bar w="w-1/3" h="h-5" />
                            <div className="flex gap-2">
                                <div className="h-7 w-12 animate-pulse rounded-lg bg-slate-200" />
                                <div className="h-7 w-14 animate-pulse rounded-lg bg-slate-200" />
                            </div>
                        </div>
                        <Bar w="w-1/4" h="h-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
