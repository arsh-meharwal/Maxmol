## Maxmol E-Commerce Android/IoS App

Welcome to Maxmol, a fully-featured React Native e-commerce mobile application I designed for famous Youtuber - [Microwave nagal](https://www.youtube.com/@MicrowaveNagal) to enable him to sell his products online all over India. Maxmol integrates several essential functionalities like Wishlist, Cart Management, Order Tracking, Razorpay Payment Gateway, and OTP-based Authentication. This README provides an overview of the app’s features and explains its functionality in detail.

Features

	1.	User Authentication (OTP Login)
	2.	Product Browsing & Search
	3.	Wishlist Management
	4.	Cart Management
	5.	Order Tracking
	6.	Online Payment via Razorpay
	7.	User Profile & Order History

1. User Authentication (Login via OTP)

The app uses an OTP-based authentication system, allowing users to log in securely without needing a password.

How It Works:

	•	Users enter their phone number to request a login OTP.
	•	The app sends a one-time password (OTP) via an SMS.
	•	Once the user enters the correct OTP, they are authenticated and logged in.
	•	If OTP verification is successful, the app stores the session for future logins until the user logs out.

This login mechanism ensures secure and convenient access, removing the need for traditional username-password credentials.

2. Product Browsing & Search

Users can browse through various product categories and search for specific items.

Key Functionalities:

	•	Search by Product Name: Users can search by entering product names in the search bar.
	•	Category-based Browsing: Products are categorized for easier navigation (e.g., Electronics, Fashion, Home Decor).
	•	Product Details: Each product has its dedicated details page where users can view images, descriptions, pricing, and availability.

3. Wishlist Management

Maxmol allows users to add products to their Wishlist for future purchases.

Key Functionalities:

	•	Add to Wishlist: On the product details page, users can click on the “Add to Wishlist” button to save a product.
	•	View Wishlist: The Wishlist page displays all saved items, allowing users to easily access products they are interested in.
	•	Remove from Wishlist: Users can remove products from the Wishlist with a simple click.

This feature helps users keep track of products they may want to purchase later.

4. Cart Management

The Cart is where users add products they are ready to purchase.

Key Functionalities:

	•	Add to Cart: Users can add products from the product page directly into their Cart.
	•	View Cart: The Cart page displays all items added by the user, including product quantities, price breakdown, and the total price.
	•	Update Quantity: Users can increase or decrease product quantities directly in the Cart.
	•	Remove Items: Products can be removed from the Cart if the user changes their mind.
	•	Proceed to Checkout: After reviewing their items, users can proceed to the payment screen.

The cart ensures that users can manage their purchases easily before checking out.

5. Order Tracking

Once users have placed an order, they can track its status in real time.

Key Functionalities:

	•	Order Status Updates: Users can check their order’s status, such as “Processing,” “Shipped,” “Out for Delivery,” or “Delivered.”
	•	Estimated Delivery Time: Each order comes with an estimated delivery date based on the shipping method selected.
	•	Order History: Users can view their previous orders in the “Order History” section of their profile.

Order tracking provides transparency, ensuring users are informed about the current state of their purchase.

6. Online Payment (Razorpay Integration)

Maxmol supports secure online payments through Razorpay, enabling users to complete purchases with ease.

How It Works:

	•	Once the user is ready to check out, they can select Razorpay as the payment method.
	•	The Razorpay payment gateway supports multiple payment options, including credit/debit cards, UPI, net banking, and wallets.
	•	After successful payment, the user receives confirmation, and the order is processed for shipping.

The Razorpay integration ensures fast, secure, and reliable payment processing, giving users various payment methods to choose from.

7. User Profile & Order History

Each user has access to their profile, where they can manage their account details and view their past orders.

Key Functionalities:

	•	Profile Information: Users can update their profile details like name, phone number, and address.
	•	Order History: The profile page displays a user’s previous orders with full details, including order items, prices, and statuses.
	•	Address Management: Users can manage their saved addresses for future orders.

App Structure

The app follows a clean and modular architecture, separating concerns into different components and services.

Main Components:

	1.	Authentication Module
	•	Handles user login, OTP verification, and session management.
	2.	Product Module
	•	Manages product browsing, search, categories, and product details.
	3.	Wishlist Module
	•	Manages the add/remove functionality for Wishlist items.
	4.	Cart Module
	•	Handles adding, removing, and updating products in the Cart.
	5.	Order Module
	•	Manages order placement, status tracking, and order history.
	6.	Payment Module
	•	Integrates with Razorpay for payment processing.

State Management

Maxmol uses Context API, ensuring that user authentication, cart, and orders are properly handled across different components of the app.

# Availability - The App is globally available on PlayStore.

Tech Stack

	•	React Native: Cross-platform mobile development framework.
	•	Context API/Redux: For state management.
	•	Firebase (or other backend): For user authentication and OTP verification.
	•	Razorpay: For handling secure online payments.
	•	Appwrite/Custom Backend: To manage data storage for products, orders, and user information.
