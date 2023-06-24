function validate_Name() {
    var nameError = document.getElementById("name-error");
    var name = document.getElementById("i_name").value;
    if (name.length == 0) {
        nameError.innerHTML = "Name Required";
        return false;
    }
    else {
        // nameError.style.color = "green";
        nameError.innerHTML = ""; //"Validation Successfull";
        return true;
    }
}

function validate_Email() {
    var emailError = document.getElementById("email-error");
    var email = document.getElementById("i_email").value;
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
        emailError.innerHTML = ""; //"Validation Successfull";
        return true;
    }
}

function validate_Password() {
    var passwordError = document.getElementById("password-error");
    var pass = document.getElementById("i_password").value;
    if (pass.length == 0) {
        passwordError.innerHTML = "Password required";
        return false;
    }
    else if (pass.length < 8) {
        passwordError.innerHTML = "Password must be at least 8 characters";
    }
    else if (!pass.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,32}$/)) {
        passwordError.innerHTML = "Password requirements: 1 capital, 1 special, 1 number, 8-32 characters";
        return false;
    }
    else {
        // passwordError.style.color="green";
        passwordError.innerHTML = ""; //"Validation Successfull";
        return true;
    }
}

function con_password() {
    var conpassError = document.getElementById("password2-error");
    var con_pass = document.getElementById("i2_password").value;
    var pass = document.getElementById("i_password").value;
    if (con_pass.length == 0) {
        conpassError.innerHTML = "Password required";
        return false;
    }
    else if (pass != con_pass) {
        conpassError.innerHTML = "Password doesn't match";
    }
    else {
        // conpassError.style.color="green";
        conpassError.innerHTML = ""; //"Validation Successfull";
        return true;
    }
}

function validate_Form() {
    var submitError = document.getElementById("submit-error");
    if (!validate_Email() || !validate_Password() || !con_password()) {
        submitError.style.display = "block"
        submitError.innerHTML = "Fix Error"
        setTimeout(function () { submit_error.style.display = "none" }, 3000)
        return false;
    }
    else {
        data = {
            msg: "Hi! This is from signup",
            email: document.getElementById("i_email").value,
            password: document.getElementById("i2_password").value,
            name: document.getElementById("i_name").value,
        };
        fetch("/signup_check", {
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
                    document.getElementById("signupForm").action = action;
                    document.getElementById("signupForm").submit();
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
        console.log("Sign up Submitted successfully");
    }
}

