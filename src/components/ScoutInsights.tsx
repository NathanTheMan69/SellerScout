import { Sparkles, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"

export function ScoutInsights() {
    return (
        <Card className="border-teal-200 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/10 h-full relative overflow-hidden">
            <CardHeader className="bg-teal-500/80 px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-white/80" />
                    <CardTitle className="text-base font-semibold text-white tracking-wide">Scout AI Insights</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-5">
                <div className="space-y-4">
                    <p className="text-slate-700 leading-relaxed">
                        Based on your recent sales and the rising trend in <span className="font-semibold text-teal-700">"Minimalist Decor"</span>,
                        we recommend updating your tags for the <span className="font-semibold text-slate-900">Ceramic Mug</span> listing.
                    </p>

                    <div className="bg-white/60 rounded-lg p-4 border border-teal-100">
                        <p className="text-sm text-slate-600 mb-2">Competitor Opportunity:</p>
                        <p className="text-slate-800 font-medium">
                            Competitors are seeing a <span className="text-green-600 font-bold">15% boost</span> using keywords like "Scandi Home".
                        </p>
                    </div>

                    <div className="pt-2">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white group">
                            Apply Recommendations
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
