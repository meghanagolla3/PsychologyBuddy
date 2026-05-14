"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker"

import { cn } from "@/src/lib/cn"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  components,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      fromYear={2020}
      toYear={2035}
      className={cn(
        "w-fit rounded-2xl border border-[#E5E7EB] bg-white p-4",
        className
      )}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),

        months: cn(
          "flex flex-col",
          defaultClassNames.months
        ),

        month: cn(
          "space-y-3",
          defaultClassNames.month
        ),

        // Header
        month_caption:
          "relative flex items-center justify-center h-10 mb-4 px-10",

        caption_label:
          "hidden",

        // Navigation
        nav:
          "absolute inset-x-0 top-0 flex items-center justify-between h-10",

        button_previous:
          "flex items-center justify-center h-10 w-10 text-gray-400 hover:text-gray-900 transition-colors",

        button_next:
          "flex items-center justify-center h-10 w-10 text-gray-400 hover:text-gray-900 transition-colors",

        // Dropdowns
        dropdowns:
          "flex items-center gap-2",

        dropdown_root:
          "relative flex items-center",

        dropdown:
          "absolute inset-0 opacity-0 cursor-pointer z-20",

        // Table
        table:
          "w-full border-collapse",

        weekdays:
          "flex justify-between mb-2",

        weekday:
          "w-9 text-center text-[13px] font-normal text-[#111827]",

        week:
          "flex justify-between mt-1",

        day:
          "h-9 w-9 p-0 text-center",

        // Outside days
        outside:
          "text-[#C9CDD3]",

        disabled:
          "text-[#D1D5DB] opacity-50",

        hidden:
          "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft
                className={cn("h-4 w-4 text-[#4B5563]", className)}
              />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRight
                className={cn("h-4 w-4 text-[#4B5563]", className)}
              />
            )
          }

          return (
            <ChevronDown
              className={cn("h-4 w-4 text-[#6B7280]", className)}
            />
          )
        },

        Nav: ({ onPreviousClick, onNextClick, previousMonth, nextMonth, className }) => (
          <nav
            className={cn(
              "absolute inset-x-0 top-0 flex items-center justify-between h-10 px-1 z-10",
              className
            )}
          >
            <button
              type="button"
              className="flex items-center justify-center h-10 w-10 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-20"
              onClick={onPreviousClick}
              disabled={!previousMonth}
              aria-label="Go to previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center h-10 w-10 text-gray-400 hover:text-gray-900 transition-colors disabled:opacity-20"
              onClick={onNextClick}
              disabled={!nextMonth}
              aria-label="Go to next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        ),

        MonthCaption: ({ children, className }) => (
          <div
            className={cn(
              "relative flex items-center justify-center h-10 mb-4 px-10 z-0",
              className
            )}
          >
            {children}
          </div>
        ),

        Dropdown: ({ value, onChange, options, children }) => {
          const selectedOption = options?.find((opt) => opt.value === value)
          
          const handleChange = (val: string) => {
            const changeEvent = {
              target: { value: val },
            } as React.ChangeEvent<HTMLSelectElement>
            onChange?.(changeEvent)
          }

          return (
            <div className="relative inline-flex items-center group px-1 py-0.5 rounded hover:bg-gray-100 transition-colors">
              <span className="text-[17px] font-medium text-[#4293FE]">
                {selectedOption?.label || children}
              </span>
              <ChevronDown className="h-4 w-4 ml-1 text-[#6B7280] group-hover:text-gray-900" />
              <select
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
              >
                {options?.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )
        },

        DayButton: CalendarDayButton,

        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayButton
      day={day}
      modifiers={modifiers}
      {...props}
      className={cn(
        defaultClassNames.day,
        "h-9 w-9 rounded-full text-[15px] font-medium",
        "flex items-center justify-center",
        "transition-colors",
        "text-[#111827]",
        "hover:bg-gray-100",

        // selected
        modifiers.selected &&
          "bg-[#4293FE] text-white hover:bg-black hover:text-white !opacity-100",

        // today
        modifiers.today &&
          !modifiers.selected &&
          "border border-gray-300",

        // outside days
        modifiers.outside &&
          "text-[#C9CDD3]",

        className
      )}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }