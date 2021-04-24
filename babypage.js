
// DOM

const body = document.querySelector(".content");

const searchBar = document.querySelector(".search");

const addButton = document.querySelector(".add-button");
const profileForm = document.querySelector("#add-form");
const exitButtons = document.querySelectorAll(".exit-button");
const memberChecks = document.querySelectorAll(".member");

const editForm = document.querySelector("#edit-form");
const updateButton = document.querySelector("#update");
const deleteButton = document.querySelector("#delete");

const addressBook = document.querySelector(".address-book");
const profileTable = document.querySelector(".profile-table");
const nonMatch = document.querySelector("#nonmatch");

const sortHeaders = document.querySelectorAll(".sort")
const nameHeader = document.querySelector("#name-header");
const resIdHeader = document.querySelector("#resId-header");
const memberHeader = document.querySelector("#member-header");

// FUNCTIONS

const Form = (() => {
    const toggle = function(form, element) {
        body.classList.toggle("blur");
        form.classList.toggle("active"); 

        // Pre-fill edit form
        if (form === editForm) {
            let index = profiles.findIndex(profile => profile.profileId == element.dataset.index);
            currentProfile = index;
            document.querySelector("#edit-fname").value = profiles[index].fname
            document.querySelector("#edit-lname").value = profiles[index].lname
            document.querySelector("#edit-resid").value = element.dataset.resid;
            if(element.dataset.member === "yes") {
                document.querySelector("#edit-member").checked = true;
                document.querySelector("#edit-form .toggle").classList.add("on");
            }
            else {
                document.querySelector("#edit-member").checked = false;
                document.querySelector("#edit-form .toggle").classList.remove("on");
            }  
        }
        else {
            Form.reset();
        }   
    };

    const hide = function(form) {
        body.classList.remove("blur");
        form.classList.remove("active");
    };

    const memberToggle = function() {
        document.querySelectorAll(".toggle").forEach(toggle => {
            toggle.classList.toggle("on")
        });
    };

    const reset = function() {
        profileForm.reset();
        document.querySelector(".toggle").classList.remove("on")
    };

    return {
      toggle,
      hide,
      memberToggle,
      reset
    };
})();

const AddressBook = (() => {
    const createRow = function(profile){
        profileTable.insertAdjacentHTML('beforeend',`<div class="personal container" data-index="${profile.profileId}" data-name="${profile.fullname}" data-resid="${profile.resId}" data-member="${profile.member}">
            <div class="detail">${profile.fullname}</div>
            <div class="detail">${profile.resId}</div>
            <div class="detail">${profile.member}</div>
            </div> `);
        document.querySelector(`[data-index="${profile.profileId}"]`).addEventListener("click", function(e) {
            Form.toggle(editForm, this);
        })
    } 

    const generate = function(profileArray) {
        //displays profiles in the table
        for (let i = 0; i < profileArray.length; i++) {
            createRow(profileArray[i])
        }
    } 

    const add = function(event) {
        event.preventDefault();
        let fname = document.querySelector("#fname").value.trim().toLowerCase();
        let lname = document.querySelector("#lname").value.trim().toLowerCase();
        let resId = document.querySelector("#resid").value.trim().toLowerCase();
        let member = (document.querySelector("#member").checked ? "yes" : "no");
        let profileId = profiles.slice(-1)[0].profileId + 1;
        let newProfile = profileFactory(fname,lname,resId,member,profileId)
        profiles.push(newProfile);
        createRow(newProfile);
        LocalStorage.refresh();
        Form.hide(profileForm);
    };

    const purge = function() {
        profiles.splice(currentProfile, 1);
        document.querySelector(`[data-index="${currentProfile}"]`).remove();
        LocalStorage.refresh();
        Form.hide(editForm);
    };

    const updateProfile = function() {
        let first = document.querySelector("#edit-fname").value;
        let last = document.querySelector("#edit-lname").value;
        profiles[currentProfile].fname = first;
        profiles[currentProfile].lname = last;
        profiles[currentProfile].fullname = first + " " + last;
        profiles[currentProfile].resId = document.querySelector("#edit-resid").value;;
        if(document.querySelector("#edit-member").checked === true) {
            profiles[currentProfile].member = "yes"
        }
        else {
            profiles[currentProfile].member = "no"
        }  
        LocalStorage.refresh();
        Form.hide(editForm);
        // change table row
        document.querySelector(`[data-index="${profiles[currentProfile].profileId}"]`).remove();
        createRow(profiles[currentProfile])
    };

    const filter = function() {
        // limits the items displayed
        let tally = 0;
        profiles.map(profile => hide(profile, searchBar.value))
    
        function hide(item, string){
            let match = document.querySelector(`[data-index="${item.profileId}"]`);
            if (!item.fullname.includes(string.toLowerCase()) && !item.resId.includes(string) && !item.member.includes(string.toLowerCase()) ){  
                match.classList.add("hide")
 
            }
            else {
                match.classList.remove("hide");
                nonMatch.classList.add("hide");
                tally += 1;
            }
        } 
    
        if (tally == 0) {
            nonMatch.classList.remove("hide");
        } 
    } 
 

    let nameSortStatus = "unsorted";
    let resIdSortStatus = "unsorted";
    let memberSortStatus = "unsorted";

    
    const sort = function() { 
        let currentOrder = "";
        let ordered = "";

        sortHeaders.forEach(header => {
            if (header == this) {
                if (header.classList.contains("sort-asc")) {
                    header.classList.add("sort-desc");
                    header.classList.remove("sort-asc");
                }
                else if (header.classList.contains("sort-desc")) {
                    header.classList.add("sort-asc");
                    header.classList.remove("sort-desc");
                }
                else {
                    header.classList.add("sort-desc");
                }
            }
            else if (header.classList.contains("sort-asc")) {
                header.classList.remove("sort-asc")
            }
            else if (header.classList.contains("sort-desc")) {
                header.classList.remove("sort-desc")
            }
        });
    
        if(this.id == "name-header"){
            if(this.classList.contains("sort-desc")) {
                currentOrder = (a, b) => a.dataset.name < b.dataset.name ? -1 : 1;
                ordered = [...document.querySelectorAll('.personal')].sort(currentOrder)
            } 
            else if(this.classList.contains("sort-asc")) {
                currentOrder = (a, b) => a.dataset.name < b.dataset.name ? -1 : 1;
                ordered = [...document.querySelectorAll('.personal')].sort(currentOrder).reverse()
            } 
        } 
        else if (this.id == "resId-header"){
            if(this.classList.contains("sort-desc")) {
                currentOrder = (a, b) => a.dataset.resid - b.dataset.resid;
                ordered = [...document.querySelectorAll('.personal')].sort(currentOrder)
            } 
            else if(this.classList.contains("sort-asc")) {
                currentOrder = (a, b) => a.dataset.resid - b.dataset.resid;
                ordered = [...document.querySelectorAll('.personal')].sort(currentOrder).reverse()
            } 
        } 
        else if (this.id == "member-header"){
            if(this.classList.contains("sort-desc")) {
                currentOrder = (a, b) => a.dataset.member < b.dataset.member ? -1 : 1;
                ordered = [...document.querySelectorAll('.personal')].sort(currentOrder)
            } 
            else if(this.classList.contains("sort-asc")) {
                currentOrder = (a, b) => a.dataset.member < b.dataset.member ? -1 : 1;
                ordered = [...document.querySelectorAll('.personal')].sort(currentOrder).reverse()
            } 
        } 

        ordered.forEach((elem, index) => {
            elem.style.order = index
        })

    } 
 
    return {
      generate,
      add,
      filter,
      sort,
      purge,
      updateProfile
    };
})();

// LOCAL STORAGE

// Check if local storage is available

const LocalStorage = (() => {
    const checkAvailability = function(type) {
        var storage;
        try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
        }
        catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
        }
    };

    const fetch = function() {
        let storedProfiles = JSON.parse(localStorage.getItem("myprofiles"));
        if (typeof(storedProfiles) !== "undefined" && storedProfiles !== null && storedProfiles.length != 0){
            profiles = storedProfiles;
        }
    };

    const refresh = function() {
        localStorage.setItem("myprofiles", JSON.stringify(profiles));
    };

    return {
      checkAvailability,
      fetch,
      refresh
    };
  })();

// EVENT HANDLERS

//addButton.addEventListener("click", Form.toggle);

addButton.addEventListener("click", function(e) {
    Form.toggle(profileForm); 
});


exitButtons.forEach(btn => btn.addEventListener("click", function(e) {
    Form.hide(profileForm);
    Form.hide(editForm);
}));

memberChecks.forEach(checkbox => checkbox.addEventListener("change", Form.memberToggle));

searchBar.addEventListener('input', AddressBook.filter);
profileForm.addEventListener("submit", AddressBook.add);
updateButton.addEventListener("click", AddressBook.updateProfile);
deleteButton.addEventListener("click", AddressBook.purge);
sortHeaders.forEach(header => header.addEventListener("click", AddressBook.sort));


// Hides the form if click is outside the form and button

window.addEventListener('click', function(e){   
    if (!profileForm.contains(e.target) && !addButton.contains(e.target) && profileForm.classList.contains("active")){
        Form.hide(profileForm)
    }
    else if (!editForm.contains(e.target) && !addressBook.contains(e.target) && editForm.classList.contains("active")){
        Form.hide(editForm)
    }
});

// ARRAY OF PROFILE OBJECTS

const profileFactory = (fname, lname, resId, member, profileId) => {
    return { fname, lname, resId, member, profileId, fullname: fname + " " + lname};
};

let profiles = [
    {fname: "john",
    lname: "doe",
    member: "no",
    resId: "676767", 
    profileId: 0,
    fullname: "john doe",
    },
    {fname: "jane",
    lname: "doe",
    member: "yes",
    resId: "566767", 
    profileId: 1,
    fullname: "jane doe",
    },
    {fname: "mike",
    lname: "brown",
    member: "no",
    resId: "322C233", 
    profileId: 2,
    fullname: "mike brown",
    }
];

// Check local storage, fetch and generate existing profiles

if (!LocalStorage.checkAvailability('localStorage')) {
    alert("How about you open me in Google Chrome or Firefox :)")
}
else {
    console.log("Your profiles are being stored in the local storage of your browser :)")
}

if (typeof(Storage) !== "undefined" && Storage !== null && localStorage.length != 0) {
    LocalStorage.fetch();
} 


AddressBook.generate(profiles)


let currentProfile = "";



// to: exit form button


localStorage.clear()