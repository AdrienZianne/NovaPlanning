var courses_dict = {};
var current_cursus

!(async function () {
    fetch_events()
        .then((events) => {
            parse_event(events);
        })
        .catch((error) => {
            console.error(error);
        });
})();

RegExp.escape = function (text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function parse_event(events) {
    var i = 0;

    // loop each cursus
    for (const [cursus, courses_list] of Object.entries(events)) {
        const button_course = document.createElement("button");
        button_course.innerHTML = cursus;
        button_course.className = "buttonList " + (i % 2 ? "impair" : "pair");
        button_course.onclick = onClickButtonList;
        document.getElementById("sbl-course").appendChild(button_course);

        const cursus_div = document.createElement("div");
        cursus_div.id = cursus;
        cursus_div.style.display = "none";
        document.getElementById("cursus-content").appendChild(cursus_div);

        i++;
        // loop each years
        for (const [year, courses] of Object.entries(courses_list)) {
            const year_container = document.createElement("div");
            year_container.id = cursus + "$" + year;
            cursus_div.appendChild(year_container);

            const title_box = document.createElement("div");
            title_box.className = "title-box";
            year_container.appendChild(title_box);

            const img = document.createElement("img");
            img.src = "./arrow.png";
            img.className = "arrow-img";
            img.onclick = derollCourses;
            title_box.appendChild(img);

            const title = document.createElement("h1");
            title.innerHTML = year;
            title.onclick = derollCourses;
            title_box.appendChild(title);

            const checkall = createRowDiv(
                cursus + "$" + year,
                "Tout sélectionner",
                onCheckAll,
                Object.keys(courses).length,
                "",
                true
            );
            title_box.appendChild(checkall.children[0]);
            title_box.appendChild(checkall.children[0]);

            const table = document.createElement("table");
            table.style.display = "none";
            table.id = year;
            year_container.appendChild(table);

            //var row = createRow(cursus,"Tout sélectionner",onCheckAll,"")
            //table.appendChild(row);

            // loop each courses
            for (const [course, event] of Object.entries(courses)) {
                let base_color = "#0026ad";
                if (event.length !== 0) {
                    base_color = event[0]["color"];
                }
                var course_id = cursus + "$" + year + "_" + course;
                const row = createRow(
                    course_id,
                    course,
                    onCheck,
                    course_id,
                    base_color
                );
                row.id = course_id;

                table.appendChild(row);

                if(!courses_dict[course]) courses_dict[course] = []
                courses_dict[course].push({"cursus" : cursus, "year" : year});
            }
        }
    }
}


function derollCourses(e) {
    table = e.target.parentElement.parentElement.lastChild;
    img = e.target.parentElement.firstChild;
    if (table.style.display == "none") {
        table.style.display = "inline";
        img.src = "./arrow-close.png";
    } else {
        table.style.display = "none";
        img.src = "./arrow.png";
    }
}


function createRow(id, text, onclick, name, color) {
    const row = document.createElement("tr");

    const checkbox_container = document.createElement("td");
    row.appendChild(checkbox_container);

    const div = createRowDiv(id, text, onclick, name, color);
    checkbox_container.appendChild(div);

    return row;
}

function onClickScrollBarRoll() {
    const x = document.getElementById("sbl-course");

    const search_container = document.getElementById("search_container");

    if (x.style.display == "none") {
        x.style.display = "flex";
        search_container.style.display = "none";
    } else {
        x.style.display = "none";
        search_container.style.display = "";
    }
}

function onClickButtonList(e) {
    let cursus = document.getElementById("cursus-content").childNodes;

    for (let i = 1; i < cursus.length; i++) {
        cursus[i].style.display = "none";
    }

    document.getElementById("search_container").style.display = "";


    document.getElementById(e.target.innerHTML).style.display = "inline";
    document.getElementById("scrlbtn").innerHTML = e.target.innerHTML;
}

function createRowDiv(id, text, onclick, name, base_color, title = false) {
    const div = document.createElement("div");
    div.className = "checkbox-line";
    div.id = id;

    const checkbox_input = document.createElement("input");

    checkbox_input.id = id;
    checkbox_input.type = "checkbox";
    checkbox_input.onclick = onclick;
    checkbox_input.name = name;
    div.appendChild(checkbox_input);

    if (!title) {
        const colorBox = document.createElement("input");
        colorBox.type = "color";
        colorBox.className = "colorWell";
        let color = "#878787";

        regex_match_color = base_color.match("^#(?:[0-9a-fA-F]{3}){1,2}$");
        if (regex_match_color !== null) {
            if (base_color.match("^#(?:[0-9a-fA-F]{3}){1,2}$").length === 1) {
                color = base_color;
            }
        }

        if (localStorage.getItem("COLORDATA " + id) !== null) {
            color = localStorage.getItem("COLORDATA " + id);
        }
        colorBox.value = color;
        div.appendChild(colorBox);
    }

    const label = document.createElement("label");
    label.htmlFor = id;
    label.innerHTML = text;
    div.appendChild(label);

    if (title) {
        const storage = Object.entries(localStorage);
        selected_course = storage.filter(([_, value]) =>
            new RegExp(".*" + RegExp.escape(id) + ".*").test(value)
        );
        checkbox_input.checked = selected_course.length == name;
    } else {
        checkbox_input.checked =
            localStorage.getItem(id.split("_")[1]) !== null;
    }

    return div;
}

function onCheckAll(e) {
    
    const isCheck = document.querySelector("input[id='"+ e.target.id + "']").checked;
    const checkboxes = document.querySelectorAll(
        '[name*="' + e.target.id + '"]'
    );

    for (const checkbox of checkboxes) {
        different_cursus_checkboxes = document.querySelectorAll(
            '[name$="' + checkbox.id.split("_")[1] + '"]'
        );
        cursus_list = [];
        for (const c of different_cursus_checkboxes) {
            cursus_list.push(c.id.split("_")[0]);
            if (isCheck && !c.checked) {
                c.checked = true;
            } else if (!isCheck && c.checked) {
                c.checked = false;
            }
        }
        toggle_course(checkbox.id, cursus_list, isCheck);
    }
}

function onCheck(e) {
    const isCheck = document.getElementsByName(e.target.id)[0].checked;

    const course = e.target.id.split("_")[1];

    different_cursus_checkboxes = document.querySelectorAll(
        '[name*="' + e.target.id.split("_")[1] + '"]'
    );

    cursus_list = [];
    for (const c of different_cursus_checkboxes) {
        cursus_list.push(c.id.split("_")[0]);
        if (isCheck && !c.checked) {
            c.checked = true;
        } else if (!isCheck && c.checked) {
            c.checked = false;
        }
    }
    toggle_course(e.target.id, cursus_list, isCheck);
}

function changeColor(id, color) {
    if (localStorage.getItem(id) !== null) {
        localStorage.setItem(id, color);
    }
}

function toggle_course(id, cursus_list, value) {
    const course = id.split("_")[1];

    if (!value) {
        localStorage.removeItem(course);
    } else {
        localStorage.setItem(course, cursus_list.join("%"));
    }

    for (const cursus of cursus_list) {
        updateCheckAll(cursus);
    }
}

function clear_all_data() {
    localStorage.clear();
    var checkboxes = document.querySelectorAll("input[type='checkbox']");
    for (const checkbox of checkboxes) {
        checkbox.checked = false;
    }
}

Object.filter = (obj, predicate) =>
    Object.keys(obj)
        .filter((key) => predicate(key))
        .reduce((key, res) => ((key[res] = obj[res]), key), {});

function search() {
    const input = document.getElementById("course_search");
    var search = input.value;

    const cursus = document.querySelector(
        '#cursus-content > div:not([style*="display: none"])'
    );

    if (search.length < 3) {
        document.querySelectorAll('#cursus-content > div:not([style*="display: none"]) > div')
            .forEach((e) => (e.style.display = ""));
        document.querySelectorAll('div[id="' + cursus.id + '"] > div > table > tr')
            .forEach((e) => (e.style.display = ""));

        table = document.querySelectorAll("div[id='" + cursus.id + "'] > div > table")
            .forEach((table) => table.style.display = "none")
        img = document.querySelectorAll("div[id='" + cursus.id + "'] > div > div > img")
            .forEach((img) => img.src = "./arrow.png")

        
        return;
    }


    const filtered = Object.keys(courses_dict)
        .filter(course => new RegExp(".*" + RegExp.escape(search.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()) + ".*")
            .test(course.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase()))
        .reduce((obj, key) => {
            obj[key] = courses_dict[key];
            return obj;
        }, {});


    document.querySelectorAll('#cursus-content > div:not([style*="display: none"]) > div')
        .forEach((e) => (e.style.display = "none"));
    document.querySelectorAll('div[id="' + cursus.id + '"] > div > table > tr')
        .forEach((e) => (e.style.display = "none"));

    for (let [course, info] of Object.entries(filtered)) {

        for(let cursus_search of info) {
            
            if(cursus_search["cursus"] != cursus.id) continue;

            const year = cursus_search["year"];

            const year_div = document.getElementById(cursus.id + "$" + year);
            if (year_div && year_div.style.display == "none") {
                year_div.style.display = "inline";

                table = document.querySelector("div[id='" + year_div.id + "'] > table")
                img = document.querySelector("div[id='" + year_div.id + "'] > div > img")
                if (table.style.display == "none") {
                    table.style.display = "inline";
                    img.src = "./arrow-close.png";
                }
            }

            const tr = document.querySelector('div[id="' + year_div.id + '"] > table > tr[id*="' + course + '"]');
            if (year_div && tr && tr.style.display == "none") {
                tr.style.display = "";
            }
        }
    }
}

function updateCheckAll(cursus_id) {
    const storage = Object.entries(localStorage);
    selected_course = storage.filter(([_, value]) =>
        new RegExp(".*" + RegExp.escape(cursus_id) + ".*").test(value)
    );
    checkbox_input = document.getElementById(cursus_id);
    checkbox_input.checked = selected_course.length == checkbox_input.name;
}

window.onclick = function (event) {
    if (!event.target.matches(".scrollbtn")) {
        document.getElementById("sbl-course").style.display = "none";
    }
};

let colorWell;
const defaultColor = "#878787";

function startupColor() {
    let colorWell = document.querySelectorAll(".colorWell");

    colorWell.forEach((colorBox) => {
        colorBox.value = localStorage.getItem(
            "COLORDATA " + colorBox.parentElement.id
        );
        colorBox.addEventListener("change", updateColor, false);
        colorBox.select();
    });
}

function updateColor(e) {
    changeColor(e.target.parentElement.id, e.target.value);
    id = e.target.parentElement.id;
    localStorage.setItem("COLORDATA " + id, e.target.value);
}

window.addEventListener("load", startupColor, false);
