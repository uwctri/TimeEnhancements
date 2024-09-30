(() => {

    const module = ExternalModules.UWMadison.TimeEnhancements
    const TD = tempusDominus
    // Supported field validation formats:
    //date_[dmy, mdy, ymd]
    //datetime_[dmy, mdy, ymd]
    //datetime_seconds_[dmy, mdy, ymd]
    //time_hh_mm_ss
    //time

    const time_12_hour = () => {

        const handle_time = (time, incSec) => {
            time = time.toLowerCase()
            let isPM = time.includes('p')
            let isAM = time.includes('a')
            time = time.replace(/[^0-9:]/g, '')
            let [hours, mins, sec] = time.split(':')
            hours ??= ""
            mins ??= ""
            sec ??= ""
            if (length(hours) > 6 || length(mins) > 2 || length(sec) > 2)
                return false
            hours = isAM && hours.slice(0, 2) == 12 ? "00" + hours.slice(2, hours.length) : hours
            isPM = isPM && hours.slice(0, 2) == 12 ? false : isPM
            if (hours && mins) {
                hours = isPM ? (parseInt(hours) + 12) % 24 : hours
            } else if (hours.length <= 2) { // Only hour
                mins = 0
                hours = isPM ? (parseInt(hours) + 12) % 24 : hours
            } else if (hours.length <= 4) {
                mins = hours.slice(-2)
                hours = hours.slice(0, hours.length - 2)
                hours = isPM ? (parseInt(hours) + 12) % 24 : hours
            } else if (hours.length <= 6) {
                sec = hours.slice(-2)
                mins = hours.slice(-4, -2)
                hours = hours.slice(0, hours.length - 4)
                hours = isPM ? (parseInt(hours) + 12) % 24 : hours
            }
            const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
            if (incSec)
                return timeStr
            return timeStr.slice(0, 5)
        }

        const time_field_event = (event) => {
            let $el = $(event.target)
            let fv = $el.attr('fv')
            if (!$el.val())
                return
            let timeStr = handle_time($el.val(), fv == "time_hh_mm_ss")
            if (!timeStr)
                return
            $el.val(timeStr)
        }

        const datetime_field_event = (event) => {
            let $el = $(event.target)
            let fv = $el.attr('fv')
            if (!$el.val())
                return
            let [date, time] = $el.val().split(' ')
            if (!time)
                return
            let timeStr = handle_time(time, fv.startsWith("datetime_seconds"))
            if (!timeStr)
                return
            $el.val(`${date} ${timeStr}`)
        }

        // Match hh:mm:ss and hh:mm
        $('input[fv=time_hh_mm_ss], input[fv=time]').off().on('change', time_field_event)

        // Match any datetime field
        $('input[fv^=datetime]').off().on('change', datetime_field_event)
    }

    const actiontag_btn = () => {
        const format_rc_date = (date, format) => {
            let month = String(date.getMonth() + 1).padStart(2, '0')
            let day = String(date.getDate()).padStart(2, '0')
            let year = date.getFullYear()
            format = format.split("_").slice(-1)
            return {
                "mdy": `${month}-${day}-${year}`,
                "dmy": `${day}-${month}-${year}`,
            }[format] ?? `${year}-${month}-${day}`
        }

        const add_days = (days = 1, weekday = false) => {
            let t = new Date(new Date().setDate(new Date().getDate() + days))
            if (weekday && (t.getDay() == "6"))
                t.setDate(t.getDate() + 2)
            if (weekday && (t.getDay() == "0"))
                t.setDate(t.getDate() + 1)
            return t
        }

        const add_btn = (name, text, days, weekday = false) => {
            const template = `<button class="jqbuttonsm ui-button ui-corner-all ui-widget timeEnhancementsBtn" data-te-weekday=${weekday} data-te-days=${days} style="margin:5px 0 5px 5px">${text}</button>`
            $(`input[name=${name}]`).parent().after(template)
        }

        const btn_event = (event) => {
            event.preventDefault()
            const $el = $(event.target)
            const $inputBox = $el.parent().find('input')
            const days = parseInt($el.attr('data-te-days'))
            const weekday = $el.attr('data-te-weekday') ? true : false
            $inputBox.val(format_rc_date(add_days(days, weekday), $inputBox.attr('fv')))
        }

        $.each(module["@TOMORROWBUTTON"], (_, name) => add_btn(name, "Tomorrow", 1))
        $.each(module["@NEXTWORKDAYBUTTON"], (_, name) => add_btn(name, "Next Workday", 1, true))
        $.each(module["@ADDDAYSBUTTON"], (name, btns) => {
            $.each(btns, (_, info) => add_btn(name, info.text, info.days))
        })
        $("body").on("click", ".timeEnhancementsBtn", btn_event)
    }

    const modern_datetime = () => {
        $(".hasDatepicker").each((_, el) => {
            const fv = $(el).attr("fv")
            const isDate = fv.includes("date")
            const isTime = fv.includes("time")
            const seconds = fv.includes("seconds") || fv.includes("ss")
            let format = []
            if (isDate)
                format.push({ "dmy": "dd-MM-yyyy", "mdy": "MM-dd-yyyy", "ymd": "yyyy-MM-dd" }[fv.split("_").slice(-1)])
            if (isTime && !seconds)
                format.push("HH:mm")
            if (isTime && seconds)
                format.push("HH:mm:ss")
            const td = new TD.TempusDominus(el, {
                useCurrent: false,
                display: {
                    components: {
                        calendar: isDate,
                        date: isDate,
                        month: isDate,
                        year: isDate,
                        decades: isDate,
                        clock: isTime,
                        hours: isTime,
                        minutes: isTime,
                        seconds: seconds,
                    },
                },
                localization: {
                    format: format.join(" "),
                    dayViewHeaderFormat: { month: 'long', year: 'numeric' },
                    startOfTheWeek: module.startWeekMonday ? "1" : "0",
                    hourCycle: module.user12hour ? "h12" : "h23"
                }
            })
            $(el).next().off().on("click", (event) => {
                td.toggle()
                event.stopPropagation()
            })
        })
    }

    $(document).ready(() => {
        time_12_hour()
        actiontag_btn()
        if (module.modern)
            modern_datetime()
    })
})()