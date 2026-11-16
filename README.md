# 🎉 VOTE WAVE INDIA 🚀 💻

Welcome to our voting web application! Powered by Node.js, Express.js, MongoDB, and Mongoose, Vote Wave India is a dynamic platform for managing users, candidates, and online voting.

Our platform allows users to register, participate in voting, and view real-time vote counts securely and conveniently.

## 📌 Features

- User Registration and Login
- User Management
- Candidate Management
- Online Voting System
- Vote Counting
- Candidate Details
- REST API Integration
- MongoDB Database Integration

## 🔗 API Endpoints

### 1. UserRoutes

**Add a User / Signup**
- Method: `POST`
- Endpoint: `/user`
- Description: Adds a user to the system with details such as name, age, email, mobile number, address, and password.

**Login User**
- Method: `POST`
- Endpoint: `/user`
- Description: User login endpoint. Verify the actual backend route and authentication implementation.

**Get All Users**
- Method: `GET`
- Endpoint: `/user`
- Description: Retrieves a list of all users in the system.

**Get User Profiles**
- Method: `GET`
- Endpoint: `/user/:profiles`
- Description: Retrieves users based on their work type (e.g., chef, waiter, manager).

**Update User Password**
- Method: `PUT`
- Endpoint: `/user/:password`
- Description: Updates user details identified by their ID.

### 2. CandidateRoutes

**Add a Candidate**
- Method: `POST`
- Endpoint: `/candidate`
- Description: Adds a candidate to the system.

**Get All Candidates**
- Method: `GET`
- Endpoint: `/candidate`
- Description: Retrieves all candidates from the system.

**Update a Candidate**
- Method: `PUT`
- Endpoint: `/candidate/:candidateId`
- Description: Updates candidate details using their ID.

**Delete a Candidate**
- Method: `DELETE`
- Endpoint: `/candidate/:candidateId`
- Description: Deletes a candidate using their ID.

**Let's Vote**
- Method: `POST`
- Endpoint: `/candidate/vote/:candidateId`
- Description: Adds a vote for a candidate based on their ID.

**Vote Count**
- Method: `GET`
- Endpoint: `/candidate/vote/count`
- Description: Retrieves the vote count of candidates.

## 📊 Data Models

### 1. User Model

The User data model represents information about users in the system.

**Fields:**
- `name`: String (User's name)
- `age`: Number (User's age)
- `email`: Email address
- `mobile`: String (User's mobile number)
- `address`: String (User's address)
- `aadharCardNumber`: Number (Unique Aadhaar card number)
- `password`: String (User's password)

**Example:**

```json
{
  "name": "Akash",
  "age": 15,
  "email": "akash@gmail.com",
  "mobile": "9323453434",
  "address": "Chikhala",
  "aadharCardNumber": 123123123123,
  "password": "hashed_password"
}
```

### 2. Candidate Model

The Candidate data model represents information about candidates available for voting.

**Fields:**
- `name`: String (Candidate's name)
- `party`: String (Candidate's political party)
- `age`: Number (Candidate's age)
- `votes`: Array (Candidate's votes)
- `votesCount`: Number (Candidate's total vote count)

**Example:**

```json
{
  "name": "Narendra Modi Ji",
  "party": "BJP",
  "age": 72,
  "votes": [],
  "votesCount": 0
}
```

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JavaScript
- HTML
- CSS

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open Project Folder

```bash
cd Voting-WebApplication
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file and configure your database connection and required environment variables.

Example:

```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
```

Use the actual environment variable names required by your backend.

### 5. Run the Application

Check the scripts available in `package.json` and run the appropriate command.

For example:

```bash
npm start
```

Or:

```bash
npm run dev
```

## 📂 Project Structure

```text
Voting-WebApplication/
│
├── controllers/
├── models/
├── routes/
├── db/
├── public/
├── server.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

Note: Update this structure according to your actual project folders and files.

## 🔒 Security

- Protect user passwords using password hashing.
- Keep database credentials inside environment variables.
- Never upload your `.env` file to GitHub.
- Validate user input and secure voting operations.

## 👨‍💻 Author

**Your Name**

GitHub: Add your GitHub profile link here.

## ⭐ Support

If you like this project, give it a star on GitHub!

**Thank you for visiting Vote Wave India! 🎉**
