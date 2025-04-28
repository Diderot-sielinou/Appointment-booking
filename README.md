
# Appointment Booking Backend

A back-end service for scheduling appointments, providing real-time updates and notifications to users and service providers via WebSockets.
This project includes user authentication, service provider slot management, appointment booking and cancellation, and real-time notifications. It also includes API documentation with Swagger and testing with Jest or Node Test Runner.

## 🚀 Features

1. User Authentication and Authorization

 User Registration:

 Clients can register with their name, email address, and password (hashed passwords).

User Login:

Clients and the service provider log in with their email address and password to receive a JSON Web Token (JWT) for secure access.

Authentication Middleware:

Protects routes by verifying JWTs.

Purpose:

Primarily designed for the client role. Service providers can be predefined or added differently, but will be required to authenticate before performing operations.

2. Service Provider and Time Slot Management
Pre-configured Providers:

Service Providers are initialized in the database.

Provider Time Slot Management:

Service Providers can create, view (and optionally delete/update) available time slots.

Client View of Available Slots:

Clients can view available slots for providers within a specific date or date range.

3. Appointment Management

Scheduling Appointments:

Clients can book available slots.

Validations verify that slots are still available before booking.

Viewing Appointments:

Clients: View their own appointments.

Providers: View appointments they have booked.

Cancelling Appointments:

Clients or providers can cancel an appointment.

4. Real-Time Notifications (via WebSockets)
Socket.IO Integration:

On booking a new appointment, notify the corresponding Service Provider in real-time.

 On cancellation, notify both Client and Provider.

## 🛠️ Tech Stack

[Node.js](https://nodejs.org/en/learn/getting-started/),
[Express.js](https://expressjs.com/),
[Socket.IO (for WebSockets)](https://socket.io/),
[PostgreSQL](https://www.postgresql.org/),
[json web tokent](https://jwt.io/),
[Swagger for API documentation](https://swagger.io/solutions/api-documentation/)

## 📦 Getting Started

1. Clone the repository:








```bash
git clone https://github.com/your-username/appointment-booking.git
cd appointment-booking

```
2. Installation


Install my-project with npm

```bash
npm install

```
3. Configure environment variables (.env):

```bash
PORT=3000
JWT_SECRET=your_secret_key
PORT=
NODE_ENV=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=
JWT_EXPIRES_IN=1h

```
4.Run the server:

```bash
npm run dev

```

## Access Swagger Documentation

[Visit](http://localhost:3000/api-docs)

## 📄 License

This project is licensed under the [MIT](https://snyk.io/fr/articles/what-is-mit-license/) License — see the LICENSE file for details.

## 🙌 Author

Made with ❤️ by [Sielinou Fonou Diderot]()










    









    
