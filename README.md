# 🎉 VOTE WAVE INDIA 🚀 💻

🌱 Welcome to our voting web app! Powered by Node.js, Express.js, MongoDB, and Mongoose, we've created a dynamic platform for all your voting needs. 🚀 Create, participate, and view real-time updates on polls, surveys, and elections with ease. 💻 Your voice matters, and we're here to make sure it's heard securely and conveniently. Let's vote together! 🎉

[Live](YOUR_LIVE_DEMO_LINK)

## Endpoints

### UserRoutes

- **Add a User/Signup:**
  - Endpoint: `POST /user`
  - Description: Adds a user to the system with details such as name, role, etc.

- **Add a User/Login:**
  - Endpoint: `POST /user`
  - Description: Adds a user to the system with details such as name, role, etc.

- **Get All User:**
  - Endpoint: `GET /user`
  - Description: Retrieves a list of all user in the system.

- **Get User Profiles:**
  - Endpoint: `GET /user/:profiles`
  - Description: Retrieves a list of user based on their work type (e.g., chef, waiter, manager).

- **Update User using Password:**
  - Endpoint: `PUT /user/:password`
  - Description: Updates the details of a specific person identified by their ID.

### CandidateRoutes

- **Add a Candidate:**
  - Endpoint: `POST /candidate`
  - Description: Adds a candidate to the system with details such as name, etc.

- **Get All Menu Items:**
  - Endpoint: `GET /candidate`
  - Description: Retrieves a list of all candidate in the system.

- **Update a Menu Item:**
  - Endpoint: `PUT /candidate/:candidateId`
  - Description: Updates the details of a specific candidate identified by its ID.

- **Delete a Menu Item:**
  - Endpoint: `DELETE /candidate/:candidateId`
  - Description: Deletes a candidate from the system based on its ID.

- **Let's Voting:**
  - Endpoint: `POST /candidate/vote/:candidateId`
  - Description: Adds a candidate vote from the system based on its ID.

- **Vote Count:**
  - Endpoint: `GET /candidate/vote/count`
  - Description: Gets a candidate vote count from the system.

## Data Models

### User

The `User` data model represents information about users in the Villages.

- **Fields:**
  - `name` : String (User's name)
  - `age` : Number (User's age)
  - `email` : Enum (User's email)
  - `mobile` : String (User's mobile number)
  - `address` : String (User's address)
  - `aadharCardNumber` : Number (User's aadharcard number, unique)
  - `password` : String (User's password)

- **Example:**

```json
{
  "name": "Khushal",
  "age": 15,
  "email": "khushalraut@gmail.com",
  "mobile": "9323453498",
  "address": "Bhandara",
  "aadharCardNumber": 122312321223,
  "password": "1234"
}
```

### Candidate

The `MenuItem` data model represents information about menu items available in the hotel.

- **Fields:**
  - `name` : String (Candidate's name)
  - `party` : String (Candidate's party ex: BJP, NCP)
  - `age` : Number (Candidate's age)
  - `votes` : Array (Candidate's votes)
  - `voteCount` : Number (Candidate's vote count)

- **Example:**

```json
{
  "name": "Narendra ModiJi",
  "party": "BJP",
  "age": 72
}
```

## Usage

1. **Install Dependencies:**

```bash
npm install
```

## APIs Used

1. **Node.js:** Used as the JavaScript runtime environment for the backend.
2. **Express.js:** Used to create server routes and handle HTTP requests.
3. **MongoDB:** Used as the database to store user and candidate information.
4. **Mongoose:** Used for database connection and data modeling.
5. **REST APIs:** Used for communication between the frontend and backend through HTTP methods such as GET, POST, PUT, and DELETE.

