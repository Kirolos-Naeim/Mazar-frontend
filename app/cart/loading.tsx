const Bar = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
    <div className={`${w} ${h} animate-pulse rounded-xl bg-slate-200`} />
);

export default function CartLoading() {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl bg-slate-200 animate-pulse h-20 w-full" />
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-3 lg:col-span-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                            <Bar w="w-1/2" h="h-5" />
                            <Bar w="w-1/4" h="h-4" />
                            <div className="flex gap-2 mt-2">
                                {[1, 2, 3, 4].map((j) => <div key={j} className="h-8 w-12 animate-pulse rounded-lg bg-slate-200" />)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                    <Bar w="w-1/2" h="h-5" />
                    <Bar h="h-10" />
                    <Bar h="h-10" />
                    <Bar h="h-10" />
                    <Bar h="h-12" />
                </div>
            </div>
        </div>
    );
}
