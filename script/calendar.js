
!async function(){
    fetch_events().then((events_fetch)=> {
        let events = []
        
        
        for (let [key,value] of Object.entries(localStorage) ){

            let spliced = value.split('%');
            let course = key;
            // if(!course) continue;
            let cursus = spliced[0].split("$")[0];
            let year = spliced[0].split("$")[1];
            let colorCustom = null;
            // if (localStorage.getItem(key) !== "") {
            //     colorCustom = value;
            // }   

            let course_events = events_fetch[cursus][year][course];
            course_events.forEach((event)=>{
                let date = new Date(event.start)
                let start = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(),date.getMinutes()]
                date = new Date(event.end)
                let end = [date.getFullYear(), date.getMonth()+1, date.getDate(), date.getHours(),date.getMinutes()]
                let title = event.title
                if (colorCustom !== null) {
                    event.color = colorCustom;
                    
                }

                event.textColor = (isLight(event.color)?"black":"white");

                let ics_event = {
                    title,
                    start,
                    end,
                }
                ics_events.push(ics_event)

                event.title = event.title.replaceAll("\n","\n\n");
            });
            events = events.concat(course_events)
        }
        calendar(events);

    }).catch(error => {
        console.error(error);
        // localStorage.clear();
    });

}();

function isLight(color) {
    if (color.length == 7) {
      const rgb = [
        parseInt(color.substring(1, 3), 16),
        parseInt(color.substring(3, 5), 16),
        parseInt(color.substring(5), 16),
      ];
      const luminance =
        (0.2126 * rgb[0]) / 255 +
        (0.7152 * rgb[1]) / 255 +
        (0.0722 * rgb[2]) / 255;
      return luminance > 0.5;
    }
    return false;
  }

function calendar(events) {
    var scrollTime = moment().subtract(moment.duration("01:00:00")).format("HH:mm:ss");
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
        height: '100vh',
        locale: 'fr',
        initialView: (window.matchMedia('screen and (max-width: 1000px)').matches)?'timeGridThreeDay':'timeGridWeek',
        views: {
            timeGridThreeDay: {
                type: 'timeGrid',
                duration: { days: 3 }
            }
        },
        scrollTime: scrollTime,
        slotMinTime:"08:00:00",
        slotMaxTime:"21:00:00",
        slotEventOverlap:false,
        expandRows: true,
        allDaySlot:false,
        nowIndicator:true,
        firstDay: 1,
        handleWindowResize: true,
        defaultAllDay: false,
        displayEventEnd: true,
        events: events,
        eventDisplay: 'block',
        titleFormat: {
            month: 'short',
            year: 'numeric'
        },
        customButtons: {
            select: {
                theme: 'true',
                text: 'Sélection des cours',
                click:() => {
                    location.href = "config.html";
                }
            },
            ics: {
                theme: 'true',
                text: 'ICS',
                click: () => download_ics(),
            },
            threeday: {
                theme: 'true',
                text: '3days',
                click: () => calendar.changeView('timeGridThreeDay'),
            },
        },
        headerToolbar: {
            start: 'select ics',
            center: 'title',
            end: (window.matchMedia('screen and (max-width: 1000px)').matches)?'today prev,next threeday,dayGridMonth':'today prev,next timeGridWeek,dayGridMonth',
        },
        fixedWeekCount: false,
        eventDidMount: function(info) {
          var tooltip = new Tooltip(info.el, {
            title: info.event.title.replaceAll("\n\n","<br/><br/>"),
            placement: 'top',
            trigger: 'hover',   
            container: 'body',
            html: true
          });
        },
    });

    calendar.render();

    let widthMatch = window.matchMedia('screen and (max-width: 1000px)');
    // mm in the function arg is the matchMedia object, passed back into the function
    widthMatch.addEventListener('change', function(mm) {

        if (mm.matches) {
            // it matches the media query: that is, min-width is >= 500px
            calendar.setOption('headerToolbar', {
                start: 'select ics',
                center: 'title',
                end: 'today prev,next threeday,dayGridMonth',
            })
        }
        else {
            calendar.setOption('headerToolbar', {
                start: 'select ics',
                center: 'title',
                end: 'today prev,next timeGridWeek,dayGridMonth',
            })
        }
    });
}
