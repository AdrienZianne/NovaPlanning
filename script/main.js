const ics_events = [];

function fetch_events(){

    return fetch('./events.json')
    .then((response) => response.json());

    // return  fetch('https://raw.githubusercontent.com/Shinkumons/NovaPlanning/action/events.json')
    //     .then((response) => response.json())
}
