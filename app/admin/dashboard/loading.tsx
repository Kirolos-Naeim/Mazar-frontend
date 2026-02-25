const Bar = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
    <div className={`${w} ${h} animate-pulse rounded-xl bg-slate-200`} />
);

export default function DashboardLoading() {
    return (
        <div className="space-y-4">
            <div className="rounded-2xl bg-slate-200 animate-pulse h-20 w-full" />
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                        <Bar w="w-1/2" h="h-4" />
                        <Bar w="w-1/3" h="h-8" />
                    </div>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                    <Bar w="w-1/3" h="h-5" />
                    {[1, 2, 3, 4].map((i) => <Bar key={i} h="h-4" />)}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                    <Bar w="w-1/3" h="h-5" />
                    {[1, 2, 3, 4].map((i) => <Bar key={i} h="h-4" />)}
                </div>
            </div>
        </div>
    );
}
