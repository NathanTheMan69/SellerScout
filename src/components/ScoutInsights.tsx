import { Sparkles, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"

export function ScoutInsights() {
    return (
        <Card className="border-teal-200 bg-gradient-to-br from-teal-50/80 to-white/80 backdrop-blur-md shadow-lg shadow-teal-900/10 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-32 w-32 text-teal-600" />
            </div>

            <CardHeader>
                <div className="flex items-center gap-2 text-teal-700">
                    <Sparkles className="h-5 w-5" />
                    <CardTitle className="text-teal-800">Scout AI Insights</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
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
