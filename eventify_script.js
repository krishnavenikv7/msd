let selections = JSON.parse(localStorage.getItem("selections")) || {
    event: null,
    decor: null,
    food: null,
    guestCount: 0,
    foodItems: [],
    payment: null
};

function selectOption(element, category, name, price) {
    let elements = document.querySelectorAll(`.${category}`);
    elements.forEach(el => el.classList.remove("selected"));

    element.classList.add("selected");
    selections[category] = { name, price };
    localStorage.setItem("selections", JSON.stringify(selections));

    if (category === 'event') {
        window.location.href = "decor.html";
    } else if (category === 'decor') {
        window.location.href = "food.html";
    } else if (category === 'food') {
        showMenu(name);
        document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
    }
}

function showMenu(type) {
    let menuItems = document.getElementById("menu-items");
    if (!menuItems) return;
    menuItems.innerHTML = "";

    let items = type === 'Veg'
        ? ['Paneer Tikka', 'Veg Biryani', 'Dal Makhani', 'Dal', 'Sambar', 'Panipuri', 'Potato Fry', 'Corn Samosa', 'Laddoo']
        : ['Chicken Curry', 'Mutton Biryani', 'Fish Fry', 'Chicken 555', 'Chicken 65', 'Chicken Biryani', 'Mutton Fry'];

    selections.foodItems = items; // Save menu items

    items.forEach(item => {
        let itemDiv = document.createElement("div");
        itemDiv.className = "menu-item";
        itemDiv.textContent = item;
        menuItems.appendChild(itemDiv);
    });

    localStorage.setItem("selections", JSON.stringify(selections));
}

function goToCart() {
    selections.guestCount = parseInt(document.getElementById("guestCount").value) || 0;

    if (!selections.food) {
        alert("Please select a food option.");
        return;
    }

    localStorage.setItem("selections", JSON.stringify(selections));
    window.location.href = "cart.html";
}

// CART page rendering logic
if (window.location.pathname.includes("cart.html")) {
    const totalCost = (selections.event?.price || 0) +
                      (selections.decor?.price || 0) +
                      ((selections.food?.price || 0) * (selections.guestCount || 0));

    document.getElementById("cart-details").innerHTML = `
        <p><strong>Event:</strong> ${selections.event?.name} - $${selections.event?.price}</p>
        <p><strong>Decor:</strong> ${selections.decor?.name} - $${selections.decor?.price}</p>
        <p><strong>Food:</strong> ${selections.food?.name} - $${selections.food?.price} per person</p>
        <p><strong>Guests:</strong> ${selections.guestCount}</p>
        <p><strong>Menu Items:</strong> ${selections.foodItems?.join(", ") || "None"}</p>
        <h3>Total Cost: $${totalCost}</h3>
        <h2>Payment Details</h2>
        <input type="text" id="card-name" placeholder="Cardholder Name" required pattern="[A-Za-z ]+" title="Only letters allowed"><br>
        <input type="text" id="card-number" placeholder="Card Number" required pattern="\\d{14}" title="Exactly 14 digits required"><br>
        <input type="text" id="cvv" placeholder="CVV" required pattern="\\d{3}" title="Exactly 3 digits required"><br>
        <button onclick="payAndBook()">Pay and Book</button>
    `;
}

function payAndBook() {
    let name = document.getElementById("card-name").value;
    let cardNumber = document.getElementById("card-number").value;
    let cvv = document.getElementById("cvv").value;

    let nameRegex = /^[A-Za-z ]+$/;
    let cardNumberRegex = /^\d{14}$/;
    let cvvRegex = /^\d{3}$/;

    if (!nameRegex.test(name)) {
        alert("Cardholder Name should contain only letters.");
        return;
    }
    if (!cardNumberRegex.test(cardNumber)) {
        alert("Card Number should be exactly 14 digits.");
        return;
    }
    if (!cvvRegex.test(cvv)) {
        alert("CVV should be exactly 3 digits.");
        return;
    }

    // Add payment details to selections
    let selections = JSON.parse(localStorage.getItem("selections")) || {};
    selections.payment = { name, cardNumber, cvv };

    // Send to backend
    fetch("http://localhost:3000/api/book", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(selections)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem("bookingId", data.bookingId);
            localStorage.setItem("thankYouMessage", data.message);

            // Optional: clear only selections
            localStorage.removeItem("selections");

            window.location.href = "confirmation.html";
        } else {
            alert("Booking failed!");
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Something went wrong. Try again.");
    });
}
