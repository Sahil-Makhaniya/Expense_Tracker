document.onload =  ()=> {
    if ((String(localStorage.getItem("expense_email")) === "null") || (localStorage.getItem("expense_email").length <= 3)) {

    } else {
        action = "/home";
        document.getElementById("loginForm").action = action;
        document.getElementById("loginForm").submit();
    }
};


document.getElementById("register_btn").addEventListener("click", () => {
    action = "/signup";
    document.getElementById("loginForm").action = action;
    document.getElementById("loginForm").submit();
});

document.getElementById("forgetpass").addEventListener("click", () => {
    action = "/forget_password";
    document.getElementById("loginForm").action = action;
    document.getElementById("loginForm").submit();
});

function validate_Email() {
    var emailError = document.getElementById("email-error-login");
    var email = document.getElementById("email-login").value;
    if (email.length == 0) {
        emailError.style.color = "red";
        emailError.innerHTML = "Email Required";

        return false;
    }
    else if (!email.match(/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/)) {
        // /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/
        // /^[a-z0-9_]+@[a-z_]+?\.[a-z]{2,3}$/
        emailError.style.color = "red";
        emailError.innerHTML = "Email Invalid";

        return false;
    }
    else {
        // emailError.style.color = "green";
        emailError.innerHTML = "";//"Validation Successfull";
        return true;
    }
}
function validate_Password() {
    var passwordError = document.getElementById("password-error-login");
    var pass = document.getElementById("password-login").value;
    if (pass.length == 0) {
        passwordError.innerHTML = "Password required";
        return false;
    }
    else if (pass.length < 8) {
        passwordError.style.color = "red";
        passwordError.innerHTML = "Password must be at least 8 characters";
        return false;
    }
    else if (!pass.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,32}$/)) {
        passwordError.style.color = "red";
        passwordError.innerHTML = "Password requirements: 1 capital, 1 special, 1 number, 8-32 characters";
        return false;
    }
    else {
        // passwordError.style.color="green";
        passwordError.innerHTML = "";//"Validation Successfull";
        return true;
    }
}

function validate_Form_Login() {
    var submitError = document.getElementById("submit-error-login");
    if (!validate_Email() || !validate_Password()) {
        submitError.style.display = "block";
        submitError.innerHTML = "Fix Error";
        setTimeout(function () { submitError.style.display = "none" }, 3000);
        return false;
    }
    else {
        var for_return = false; // What to return in current function
        data = {
            msg: "Hi! This is from login",
            email: document.getElementById("email-login").value,
            password: document.getElementById("password-login").value
        };
        fetch("/login_check", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(data => {
                console.log(data.message); // Handle the response data
                console.log(data.success, true);
                if (data.success) {
                    // Store in local Storage
                    localStorage.setItem("expense_name", `${data.name}`);
                    localStorage.setItem("expense_email", `${data.email}`);
                    localStorage.setItem("expense_password", `${data.password}`);
                    action = "/home";
                    localStorage.setItem('nav_active', "home");
                    document.getElementById("loginForm").action = action;
                    document.getElementById("loginForm").submit();
                    for_return = true;
                } else {
                    submitError.style.display = "block";
                    submitError.innerHTML = "Email or Password Invalid!";
                    setTimeout(function () { submitError.style.display = "none" }, 3000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        console.log("Login Submitted successfully");
        return for_return;
    }
}