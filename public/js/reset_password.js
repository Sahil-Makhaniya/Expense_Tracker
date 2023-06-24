window.onload = function () {
    document.getElementById("f_email_holder").placeholder = localStorage.getItem("f_email");
};

function validate_Password() {
    var pass = document.getElementById("re1_password").value;
    if ((pass.length == 0) || (pass.length < 8)) {
        if (document.getElementById("re1_password").classList.contains("is-valid")) {
            document.getElementById("re1_password").classList.remove("is-valid");
        }
        if (!document.getElementById("re1_password").classList.contains("is-invalid")) {
            document.getElementById("re1_password").classList.add("is-invalid");
        }
        return false;
    } else if (!pass.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,32}$/)) {
        if (document.getElementById("re1_password").classList.contains("is-valid")) {
            document.getElementById("re1_password").classList.remove("is-valid");
        }
        if (!document.getElementById("re1_password").classList.contains("is-invalid")) {
            document.getElementById("re1_password").classList.add("is-invalid");
        }
        return false;
    } else {
        if (document.getElementById("re1_password").classList.contains("is-invalid")) {
            document.getElementById("re1_password").classList.remove("is-invalid");
        }
        if (!document.getElementById("re1_password").classList.contains("is-valid")) {
            document.getElementById("re1_password").classList.add("is-valid");
        }
        return true;
    }
}

function con_password() {
    var pass = document.getElementById("re1_password").value;
    var con_pass = document.getElementById("re2_password").value;
    if (con_pass.length == 0 || !validate_Password() || (pass != con_pass)) {
        if (document.getElementById("re2_password").classList.contains("is-valid")) {
            document.getElementById("re2_password").classList.remove("is-valid");
        }
        if (!document.getElementById("re2_password").classList.contains("is-invalid")) {
            document.getElementById("re2_password").classList.add("is-invalid");
        }
        document.getElementById("confirm_btn").disabled = true;
        return false;
    } else {
        if (!document.getElementById("re2_password").classList.contains("is-valid")) {
            document.getElementById("re2_password").classList.add("is-valid");
        }
        if (document.getElementById("re2_password").classList.contains("is-invalid")) {
            document.getElementById("re2_password").classList.remove("is-invalid");
        }
        document.getElementById("confirm_btn").disabled = false;
        return true;
    }
}

document.getElementById("confirm_btn").addEventListener("click", () => {
    if (validate_Password() && con_password()) {
        data = {
            msg: "request to verify otp and reset password",
            email: localStorage.getItem("f_email"),
            password: document.getElementById("re2_password").value,
            otp: localStorage.getItem("f_otp")
        };
        fetch("/reset_password", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(data => {
                console.log(data.message, data.reset_success, data.null_otp);
                if (data.reset_success) {
                    localStorage.removeItem("f_email");
                    localStorage.removeItem("f_otp");

                    alert("Reset password successfully, now you can login with new password");
                    
                    action = "/";
                    document.getElementById("reset_pass_form").action = action;
                    document.getElementById("reset_pass_form").submit();
                }
                if(data.null_otp){
                    alert("Please try 'forgot password' option from beginning!");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});