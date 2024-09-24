(() => {

    const module = ExternalModules.UWMadison.TimeEnhancements

    // TODO setup new picker (try to get datetime-local to work)
    // TODO config for the picker (field config based - max year, seconds, enable time,  )

    const time_picker = () => {

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

        // Match hh:mm:ss and hh:mm
        $('input[fv^=time_hh_mm]').off().on('change', (event) => {
            let $el = $(event.target)
            let fv = $el.attr('fv')
            if (!$el.val())
                return
            let timeStr = handle_time($el.val(), fv == "time_hh_mm_ss")
            if (!timeStr)
                return
            $el.val(timeStr)
        })

        // Match datetime fields
        $('input[fv^=datetime]').off().on('change', (event) => {
            let $el = $(event.target)
            let fv = $el.attr('fv')
            if (!$el.val())
                return
            let [date, time] = $el.val().split(' ')
            let timeStr = handle_time(time, fv.startsWith("datetime_seconds"))
            if (!timeStr)
                return
            $el.val(`${date} ${timeStr}`)
        })
    }

    const actiontag_btn = () => {
        const formatRedcapDate = (date, format) => {
            let month = String(date.getMonth() + 1).padStart(2, '0')
            let day = String(date.getDate()).padStart(2, '0')
            let year = date.getFullYear()
            format = format.split("_").slice(-1)
            return {
                "mdy": `${month}-${day}-${year}`,
                "dmy": `${day}-${month}-${year}`,
            }[format] ?? `${year}-${month}-${day}`
        }

        const addDays = (days = 1, weekday = false) => {
            let t = new Date(new Date().setDate(new Date().getDate() + days))
            if (weekday && (t.getDay() == "6"))
                t.setDate(t.getDate() + 2)
            if (weekday && (t.getDay() == "0"))
                t.setDate(t.getDate() + 1)
            return t
        }

        const addbtn = (name, text, days, weekday = false) => {
            const template = `<button class="jqbuttonsm ui-button ui-corner-all ui-widget timeEnhancementsBtn" data-te-weekday=${weekday} data-te-days=${days} style="margin:5px 0 5px 5px">${text}</button>`
            $(`input[name=${name}]`).parent().after(template)
        }

        $.each(module["@TOMORROWBUTTON"], (_, name) => addbtn(name, "Tomorrow", 1))
        $.each(module["@NEXTWORKDAYBUTTON"], (_, name) => addbtn(name, "Next Workday", 1, true))
        $.each(module["@ADDDAYSBUTTON"], (name, btns) => {
            $.each(btns, (_, info) => addbtn(name, info.text, info.days))
        })
        $("body").on("click", ".timeEnhancementsBtn", function (event) {
            event.preventDefault()
            const $inputBox = $(this).parent().find('input')
            const days = parseInt($(this).attr('data-te-days'))
            const weekday = $(this).attr('data-te-weekday') ? true : false
            $inputBox.val(formatRedcapDate(addDays(days, weekday), $inputBox.attr('fv')))
        })
    }

    $(document).ready(() => {
        time_picker()
        actiontag_btn()
    })
})()