import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { cn } from "@/lib/utils"

const reviews = [
    { id: 1, user: "Sarah M.", initial: "S", rating: 5, text: "Came out great on the cup!", time: "2 mins ago" },
    { id: 2, user: "Mike T.", initial: "M", rating: 5, text: "Fast shipping, thanks!", time: "1 hour ago" },
    { id: 3, user: "Jessica L.", initial: "J", rating: 4, text: "Good quality but smaller than expected.", time: "3 hours ago" },
    { id: 4, user: "David R.", initial: "D", rating: 5, text: "Perfect for my shop.", time: "5 hours ago" },
    { id: 5, user: "Emily W.", initial: "E", rating: 5, text: "Love it!", time: "1 day ago" },
    { id: 6, user: "Alex K.", initial: "A", rating: 5, text: "Will buy again.", time: "2 days ago" },
]

export function RecentReviews() {
    return (
        <Card className="border-white/50 bg-white/70 backdrop-blur-md shadow-lg shadow-teal-900/5 h-full overflow-hidden">
            <CardHeader className="bg-teal-600 px-4 md:px-5 py-3 md:py-3.5">
                <CardTitle className="text-sm md:text-base font-semibold text-white tracking-wide">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-4 md:pt-5">
                <div className="space-y-4 md:space-y-6 max-h-[300px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                    {reviews.map((review) => (
                        <div key={review.id} className="flex gap-3 md:gap-4">
                            <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold flex-shrink-0 text-sm md:text-base">
                                {review.initial}
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center justify-between w-full gap-2">
                                    <span className="text-sm font-semibold text-slate-900 truncate">{review.user}</span>
                                    <span className="text-[10px] md:text-xs text-slate-400 flex-shrink-0">{review.time}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "h-3 w-3 md:h-3.5 md:w-3.5",
                                                i < review.rating ? "fill-orange-400 text-orange-400" : "fill-slate-200 text-slate-200"
                                            )}
                                        />
                                    ))}
                                </div>
                                <p className="text-[13px] md:text-sm text-slate-600 leading-relaxed">
                                    {review.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
