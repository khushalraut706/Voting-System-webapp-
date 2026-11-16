# 🗳️ Vote Wave India

A voting web application built with **Node.js, Express.js, MongoDB (Mongoose) and JWT**.
Voters sign up with their Aadhar card number, vote for one candidate (once only), and see live results.
One admin manages the candidate list and cannot vote.



## Features
- Sign up / log in with Aadhar card number (12 digits) + password (passwords stored as bcrypt hashes)
- JWT authentication
- View candidates and vote (one vote per user, admin cannot vote)
- Live vote counts sorted by votes
- Admin: add, update and delete candidates
- Change password
- Responsive frontend (mobile, tablet, desktop)

## Project structure
```
voting-webapp/
├── public/                 # frontend (served by Express)
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
├── models/
│   ├── candidate.js
│   └── user.js
├── routes/
│   ├── candidateRoutes.js
│   └── userRoutes.js
├── scripts/createAdmin.js  # creates the admin account
├── db.js                   # MongoDB connection
├── jwt.js                  # JWT middleware + token generator
├── server.js               # app entry point
├── planning.txt            # original planning notes
├── temp_data.json          # original sample candidate data
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup
1. Install Node.js 18+ and MongoDB (local) or create a free MongoDB Atlas cluster.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your environment file and edit the values:
   ```bash
   cp .env.example .env        # Windows: copy .env.example .env
   ```
4. Create the admin account (admins cannot be created through signup):
   ```bash
   npm run create-admin
   ```
5. Start the server:
   ```bash
   npm start          # or: npm run dev   (auto-restart with nodemon)
   ```
6. Open http://localhost:3000

## API endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api` | – | Welcome message |
| POST | `/user/signup` | – | Create a voter account, returns token |
| POST | `/user/login` | – | Login with `aadharCardNumber` + `password`, returns token |
| GET | `/user/profile` | Token | Logged-in user's profile |
| PUT | `/user/profile/password` | Token | Body: `currentPassword`, `newPassword` |
| GET | `/user` | Admin | List all users (no password hashes) |
| GET | `/candidate` | – | List candidates |
| POST | `/candidate` | Admin | Add candidate (`name`, `party`, `age`) |
| PUT | `/candidate/:candidateId` | Admin | Update candidate |
| DELETE | `/candidate/:candidateId` | Admin | Delete candidate |
| POST | `/candidate/vote/:candidateId` | Token (voter) | Cast your single vote |
| GET | `/candidate/vote/count` | – | Candidates sorted by vote count |

Send the token as `Authorization: Bearer <token>`.

## Example requests
```bash
curl -X POST localhost:3000/user/signup -H "Content-Type: application/json" \
  -d '{"name":"Akash","age":25,"address":"Pune","aadharCardNumber":122312231223,"password":"1234"}'

curl -X POST localhost:3000/user/login -H "Content-Type: application/json" \
  -d '{"aadharCardNumber":122312231223,"password":"1234"}'
```

## Data models
**User**: name, age, email, mobile, address, aadharCardNumber (unique, 12 digits), password, role (`voter` | `admin`), isVoted
**Candidate**: name, party, age, votes[{ user, votedAt }], voteCount
