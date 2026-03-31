# MongoDB Setup

## Purpose

MongoDB is now used for the live application layer:

- `student_logins`
- `student_assessments`
- `behavior_tracking`
- `generated_reports`
- `teacher_parent_dashboard`

Your CSV dataset can still remain in `dataset/` for ML work, but MongoDB now stores the assessment-side application data.

## Step 1. Install backend packages

```powershell
pip install -r backend\requirements.txt
```

## Step 2. Start MongoDB

Make sure MongoDB is running locally at:

```text
mongodb://localhost:27017/
```

If you are using a different MongoDB URI, set:

```powershell
$env:MONGO_URI="your-mongodb-uri"
$env:MONGO_DB_NAME="adaptive_learning_db"
```

## Step 3. Optional: import the CSV dataset for Mongo-backed dataset summary

```powershell
python backend\import_dataset_to_mongodb.py
```

This populates:

```text
combined_final_dataset
```

## Step 4. Run the backend

```powershell
python backend\api.py
```

## Step 5. Run the frontend

Open another terminal:

```powershell
cd frontend
npm run dev
```

## What gets stored automatically

When the app is used, MongoDB now stores:

### 1. Student login

Endpoint:

```text
POST /student-login
```

Collection:

```text
student_logins
```

### 2. Assessment submission and prediction

Endpoint:

```text
POST /predict
```

Collection:

```text
student_assessments
```

### 3. Behavior tracking

Endpoint:

```text
POST /behavior-track
```

Collection:

```text
behavior_tracking
```

### 4. Final generated report

Endpoint:

```text
POST /save-report
```

Collection:

```text
generated_reports
```

### 5. Teacher / parent dashboard records

Endpoint:

```text
GET /dashboard-records/<student_id>
```

Collection:

```text
teacher_parent_dashboard
```

## Example full run procedure

### Terminal 1

```powershell
cd c:\Users\jessi\OneDrive\Desktop\project-folder
python backend\api.py
```

### Terminal 2

```powershell
cd c:\Users\jessi\OneDrive\Desktop\project-folder\frontend
npm run dev
```

### Then in browser

1. Open the frontend URL
2. Login with student details
3. Complete behavioral verification
4. Complete assessment
5. Open final report

At that point MongoDB will contain the live app records.

## To fetch teacher/parent dashboard data for one student

Example:

```text
http://127.0.0.1:5000/dashboard-records/STU001
```
