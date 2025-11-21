import { Card, CardContent, CardHeader } from "@/components/Card"

export function TableSkeleton() {
    return (
        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 overflow-hidden">
            <CardHeader className="space-y-2">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-teal-50/50 text-slate-600">
                            <tr>
                                {[1, 2, 3, 4].map((i) => (
                                    <th key={i} className="px-6 py-4">
                                        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5].map((row) => (
                                <tr key={row}>
                                    {[1, 2, 3, 4].map((col) => (
                                        <td key={col} className="px-6 py-4">
                                            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}
