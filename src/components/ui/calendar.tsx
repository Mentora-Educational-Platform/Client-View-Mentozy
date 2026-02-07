"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"
import { buttonVariants } from "../../components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 p-0 !bg-transparent !text-gray-600 hover:!bg-gray-100 dark:hover:!bg-slate-800 transition-colors"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                    "text-slate-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-slate-400",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-transparent [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:!bg-amber-100 transition-colors !rounded-xl"
                ),
                day_range_end: "day-range-end",
                day_selected:
                    "!bg-amber-500 !text-white hover:!bg-amber-600 hover:!text-white focus:!bg-amber-500 focus:!text-white !opacity-100 shadow-md !rounded-xl",
                day_today: "bg-slate-100 text-slate-900 border border-slate-200 !rounded-xl",
                day_outside:
                    "day-outside text-slate-500 opacity-50 aria-selected:bg-transparent aria-selected:text-slate-500 aria-selected:opacity-30 dark:text-slate-400",
                day_disabled: "text-slate-500 opacity-50 dark:text-slate-400",
                day_range_middle:
                    "aria-selected:bg-transparent aria-selected:text-slate-900 dark:aria-selected:text-slate-50",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: () => <ChevronLeft className="h-5 w-5 !text-gray-800" />,
                IconRight: () => <ChevronRight className="h-5 w-5 !text-gray-800" />,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
