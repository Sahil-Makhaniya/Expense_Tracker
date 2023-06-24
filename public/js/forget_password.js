document.getElementById("get_otp_btn").addEventListener("click", () => {
    const data_ = {
        msg: "Hi! This is from forget password",
        email: document.getElementById("f_email").value
    };
    fetch("/forget_password_verification", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data_)
    }).then(response => response.json())
        .then(data => {
            console.log(data.message); // Handle the response data
            console.log(data.email_success, true);
            if (data.email_success) {
                document.getElementById("f_instrn").innerHTML = "Check your email for OTP (It may be in spam)";
                document.getElementById("get_otp_btn").disabled = true;
                document.getElementById("f_email").disabled = true;
                document.getElementById("verify_otp_btn").disabled = false;
                document.getElementById("f_otp").disabled = false;
                localStorage.setItem("f_email", data_.email);
            } else {
                document.getElementById("f_instrn").innerHTML = "Invalid Email";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

function validate_Email() {
    var emailError = document.getElementById("f_instrn");
    var email = document.getElementById("f_email").value;
    if (email.length == 0) {
        emailError.style.color = "red";
        emailError.innerHTML = "Email Required";
        document.getElementById("get_otp_btn").disabled = true;
        return false;
    }
    else if (!email.match(/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/)) {
        // /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/
        // /^[a-z0-9_]+@[a-z_]+?\.[a-z]{2,3}$/
        emailError.style.color = "red";
        emailError.innerHTML = "Email Invalid";
        document.getElementById("get_otp_btn").disabled = true;
        return false;
    }
    else {
        // emailError.style.color = "green";
        emailError.innerHTML = ""; //"Validation Successfull";
        document.getElementById("get_otp_btn").disabled = false;
        return true;
    }
}


document.getElementById("verify_otp_btn").addEventListener("click", () => {
    let temp_otp = document.getElementById("f_otp").value;
    if (temp_otp >= 1000 && temp_otp <= 9999) {
        const data_ = {
            msg: "Hi! This is from forget password",
            email_: document.getElementById("f_email").value,
            otp: document.getElementById("f_otp").value
        };
        fetch("/forget_password_verification", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data_)
        }).then(response => response.json())
            .then(data => {
                console.log(data.message); // Handle the response data
                console.log(data.otp_success, true);
                if (data.otp_success) {
                    localStorage.setItem("f_otp", data_.otp);
                    action = "/reset_password";
                    document.getElementById("email_verify_form").action = action;//`http://localhost:5566/new_password`;
                    document.getElementById("email_verify_form").submit();
                } else { 
                    setTimeout(function(){
                        document.getElementById("f_instrn").style.color = "red";
                        document.getElementById("f_instrn").innerHTML = "Invalid OTP, Try Again!";
                    },3000);
                    location.reload()
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
});