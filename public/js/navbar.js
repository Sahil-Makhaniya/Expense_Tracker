document.getElementById("logout").addEventListener("click", () => {
    data = {
        email: localStorage.getItem("expense_email"),
        name: localStorage.getItem("expense_name"),
        password: localStorage.getItem("expense_password")
    }
    fetch("/logout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data)
    }).then(response => response.json())
        .then(data => {
            console.log("logout_success", data.logout_success);
            if (data.logout_success) {
                // Store in local Storage
                localStorage.removeItem("expense_name");
                localStorage.removeItem("expense_email");
                localStorage.removeItem("expense_password");
                localStorage.removeItem("reload");
                localStorage.removeItem("nav_active");

                action = "/";
                document.getElementById("navbar_from").action = action;
                document.getElementById("navbar_from").submit();
            } else {
                alert("Logout failed!");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });


});

document.getElementById("home").addEventListener("click", () => {
    localStorage.removeItem('reload');
    action = "/home";
    localStorage.setItem('nav_active', "home");
    document.getElementById("navbar_from").action = action;
    document.getElementById("navbar_from").submit();
});

document.getElementById("category").addEventListener("click", () => {
    localStorage.removeItem('reload');
    action = "/category";
    localStorage.setItem('nav_active', "category");
    document.getElementById("navbar_from").action = action;
    document.getElementById("navbar_from").submit();
});

document.getElementById("transaction").addEventListener("click", () => {
    localStorage.removeItem('reload');
    action = "/transaction";
    localStorage.setItem('nav_active', "transaction");
    document.getElementById("navbar_from").action = action;
    document.getElementById("navbar_from").submit();
});

document.getElementById("contact_us").addEventListener("click", () => {
    localStorage.removeItem('reload');
    action = "/contact_us";
    localStorage.setItem('nav_active', "contact_us");
    document.getElementById("navbar_from").action = action;
    document.getElementById("navbar_from").submit();
});

// window.onload = () => {
//     let elements = document.getElementsByClassName("active");
//     console.log(elements);
//     for (var i = 0; i < elements.length; i++) {
//         elements[i].classList.remove('active');
//     }
//     document.getElementById(localStorage.getItem('nav_active')).classList.add("active");
// };

window.addEventListener("load", () => {
    let elements = document.getElementsByClassName("active");
    console.log(elements);
    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove('active');
    }
    document.getElementById(localStorage.getItem('nav_active')).classList.add("active");
});
