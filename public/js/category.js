// it_will_be_used_just_once_category = () => {
//     data = {
//         email: localStorage.getItem('expense_email'),
//         password: localStorage.getItem('expense_password'),
//         name: localStorage.getItem('expense_name')
//     }
//     fetch("/category_test", {
//         method: "POST",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify(data)
//     });
// }

// window.onload = () => {
//     console.log("Window loaded");
//     // it_will_be_used_just_once_category();
//     // if (!localStorage.getItem('reload')) {
//     //     localStorage['reload'] = true;
//     //     window.location.reload();
//     // } else {
//     //     localStorage.removeItem('reload');
//     // }

//     // Navbar Active
//     let elements = document.getElementsByClassName("active");
//     console.log(elements);
//     for (var i = 0; i < elements.length; i++) {
//         elements[i].classList.remove('active');
//     }
//     document.getElementById(localStorage.getItem('nav_active')).classList.add("active");
// }



function load_trans_of_category(category) {
    let elements = document.getElementsByClassName("category_btn");
    for (var i = 0; i < elements.length; i++) {
        if (elements[i].classList.contains("btn-secondary")) {
            elements[i].classList.remove("btn-secondary");
            elements[i].classList.add("btn-outline-secondary");
        }
    }
    document.getElementById(`${category}_btn`).classList.remove("btn-outline-secondary");
    document.getElementById(`${category}_btn`).classList.add("btn-secondary");

    x = {
        category: category,
        email: localStorage.getItem('expense_email'),
        password: localStorage.getItem('expense_password'),
        name: localStorage.getItem('expense_name')
    }

    fetch("/categorical_transactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(x)
    }).then(response => response.json())
        .then(data => {
            trans = data.transactions;
            s = ``;
            if (trans.length == 0) {
                s += 'There is no transaction in this category.';
            } else {
                for (var i = 0; i < trans.length; i++) {
                    s += `
                    <div class="card mx-2 my-3 recent_shadow"
                        style="background-image: linear-gradient(to right,#dad8d8,white,#dad8d8);">
                        <div class="row text-center mx-2">
                            <div class="text-center">
                                <a><b>Description:</b></a>
                                <a>${trans[i].description}</a>
                            </div>
                        </div>
                        <div class="row justify-content-center">
                            <div class="col-auto">
                                <a><b>Catagory:</b></a>
                                <a>${trans[i].category}</a>
                            </div>
                            <div class="col-auto">
                                <a><b>Date:</b></a>
                                <a>${trans[i].date}</a>
                            </div>
                            <div class="col-auto">
                                <a><b>Amount:</b></a>`;
                    if (trans[i].type === "Received") {
                        s += `<a style="color: rgb(3, 188, 3);">+${trans[i].amount}</a>`;
                    } else if (trans[i].type === "Paid") {
                        s += `<a style="color: red;">${trans[i].amount}</a>`;
                    }
                    s += `
                            </div>
                        </div>
                    </div>`;

                }
            }

            document.getElementById("trans_category_body").innerHTML = s;
            document.getElementById("total_in_category").innerHTML = data.total;
        })
        .catch(error => {
            console.error('Error:', error);
        });

}

function delete_category(category) {
    let result = confirm(`Are you sure you want to delete category ${category}?`);
    if (result) {
        let x = {
            category: category,
            email: localStorage.getItem('expense_email'),
            password: localStorage.getItem('expense_password'),
            name: localStorage.getItem('expense_name')
        }
        fetch("/delete_category", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(x)
        }).then(response => response.json())
            .then(data => {
                console.log("deleted category", data.delete_success);
                if (data.delete_success) {
                    alert("Category deleted successfully!");
                    window.location.reload();
                } else {
                    alert("Category delete failed!");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}


// Add a new category
document.getElementById("add_catagory_btn").addEventListener('click', async () => {
    let category = document.getElementById("add_catagory_input").value;
    x = {
        category: category,
        email: localStorage.getItem('expense_email'),
        password: localStorage.getItem('expense_password'),
        name: localStorage.getItem('expense_name')
    }
    fetch("/add_category", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(x)
    }).then(response => response.json())
        .then(data => {
            console.log("added category", data.add_success);
            if (data.add_success) {
                alert("Category added successfully!");
                window.location.reload();
            } else {
                alert("Category insert failed!");
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});