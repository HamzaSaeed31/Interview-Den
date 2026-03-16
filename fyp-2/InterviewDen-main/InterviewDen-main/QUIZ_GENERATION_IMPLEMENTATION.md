# Quiz Generation API Integration - Complete Implementation ✅

## Overview
Successfully integrated the quiz generation API into the job creation and management flow. Quizzes are automatically generated when jobs are posted and can be regenerated at any time.

---

## ✅ Features Implemented

### 1. **Automatic Quiz Generation on Job Creation**
- Quiz is automatically generated when job status changes to 'active'
- Runs in background after successful job posting
- Non-blocking - job creation succeeds even if quiz generation fails
- Shows loading toast: "Generating quiz questions..."

### 2. **Quiz Regeneration**
- Companies can regenerate quizzes at any time from the Settings tab
- Replaces existing quiz with newly generated one
- Shows loading state during regeneration
- Confirms success with question count

### 3. **Quiz Status Display**
- Settings tab shows quiz status (Generated / Not Generated)
- Displays quiz metadata:
  - Number of questions
  - Difficulty level
  - Generation date
  - Quiz ID
- Color-coded status indicators

---

## 🔧 API Integration Details

### API Endpoint
```
POST http://127.0.0.1:8000/quiz
```

### Request Format
**Content-Type:** `multipart/form-data`

**Parameters:**
- `job_json` (File, Required): JSON file with job details
- `questions` (Form field, Optional): Number of questions to generate

### Data Mapping

#### From Job Form to API Format
```javascript
{
  job_title: formData.title,
  role_description: formData.overview || formData.description,
  experience_required: {
    years_of_experience: "Not specified",
    level: "Mid Level" // Mapped from difficulty
  },
  skills_required: {
    technical_skills: ["React", "Node.js", ...], // From quiz topics
    soft_skills: ["Communication", ...]          // Extracted from requirements
  },
  job_responsibilities: formData.responsibilities
}
```

#### Difficulty Mapping
| Form Value | API Level |
|------------|-----------|
| `easy` | Entry Level |
| `medium` | Mid Level |
| `hard` | Senior |
| `expert` | Lead/Architect |

#### Questions Calculation
- **Formula**: `Math.min(Math.floor(duration / 3), 20)`
- **Example**: 60 min duration = 20 questions (max)
- **Example**: 45 min duration = 15 questions
- **Default**: 15 questions if duration not specified

### Response Structure
```json
{
  "quiz_id": "quiz_junior_front_end_developer_f858c5ba",
  "job_info": { ... },
  "metadata": {
    "question_count": 15,
    "level": "Junior"
  },
  "questions": [
    {
      "question": "...",
      "options": [
        { "letter": "A", "text": "..." },
        { "letter": "B", "text": "..." },
        { "letter": "C", "text": "..." },
        { "letter": "D", "text": "..." }
      ],
      "correct_answer": "A"
    }
  ]
}
```

### Storage
Quiz data is stored in the `jobs` table:
```javascript
custom_fields: {
  // ... other fields
  generated_quiz: {
    quiz_id: "quiz_...",
    metadata: {
      question_count: 15,
      level: "Mid Level"
    },
    questions: [...],
    generated_at: "2025-01-07T12:00:00Z"
  }
}
```

---

## 📁 Code Structure

### Job Creation Flow (`app/(company)/company/jobs/create/page.tsx`)

#### 1. `generateQuizForJob()` Function
```javascript
const generateQuizForJob = async (jobId: string, jobData: any) => {
  // 1. Map difficulty to experience level
  // 2. Extract technical and soft skills
  // 3. Prepare API request data
  // 4. Create FormData with job JSON
  // 5. Call quiz generation API
  // 6. Store quiz in database
  // 7. Handle errors gracefully
}
```

**Key Features:**
- ✅ Maps form data to API format
- ✅ Extracts soft skills from requirements
- ✅ Calculates optimal question count
- ✅ Handles API errors without failing job creation
- ✅ Shows user-friendly error messages

#### 2. `submitJob()` Function
```javascript
const submitJob = async () => {
  // 1. Save job to database
  // 2. If AI test generation enabled:
  //    - Show "Generating quiz..." toast
  //    - Call generateQuizForJob()
  // 3. Redirect to jobs list
}
```

**Flow:**
1. Job is created with status 'active'
2. Returns inserted job ID
3. Calls `generateQuizForJob()` if `ai_test_generation = true`
4. Quiz generation happens asynchronously
5. Redirects user regardless of quiz generation status

---

### Job Management Flow (`app/(company)/company/jobs/[id]/page.tsx`)

#### 1. `handleRegenerateQuiz()` Function
```javascript
const handleRegenerateQuiz = async () => {
  // 1. Fetch current job data
  // 2. Extract quiz configuration
  // 3. Prepare API request
  // 4. Call quiz generation API
  // 5. Update database with new quiz
  // 6. Reload page to show changes
}
```

**Features:**
- ✅ Loading state with spinner
- ✅ Fetches fresh job data
- ✅ Reuses existing quiz configuration
- ✅ Updates only the quiz, preserves other data
- ✅ Shows success message with question count

#### 2. Quiz Status Display (Settings Tab)
```javascript
// Shows one of two states:

// State 1: Quiz Generated ✅
<div>
  <p>Quiz Generated</p>
  <p>{question_count} questions • {level}</p>
  <p>Generated: {date}</p>
  <Button>Regenerate Quiz</Button>
  <div>Quiz ID: {quiz_id}</div>
</div>

// State 2: No Quiz ⚠️
<div>
  <p>No Quiz Generated</p>
  <p>Generate a quiz to enable candidate assessments</p>
  <Button>Generate Quiz</Button>
</div>
```

**Color Coding:**
- 🟢 **Green**: Quiz successfully generated
- 🟠 **Orange**: No quiz generated yet

---

## 🎯 User Experience Flow

### Creating a New Job
1. Company fills out job details (5 steps)
2. On final step, clicks "Create Job"
3. ✅ Job saved successfully
4. 📊 Toast: "Generating quiz questions..."
5. 🎉 Quiz generated and stored
6. 🔄 Redirected to jobs list

### Managing Existing Job
1. Navigate to Settings tab
2. See quiz status:
   - **If generated**: Shows quiz info + "Regenerate" button
   - **If not generated**: Shows "Generate Quiz" button
3. Click button to (re)generate
4. ⏳ Loading state: "Generating..." / "Regenerating..."
5. ✅ Success: "Quiz generated successfully! (15 questions)"
6. 🔄 Page reloads with updated quiz data

---

## 🛡️ Error Handling

### API Failures
```javascript
try {
  const response = await fetch('http://127.0.0.1:8000/quiz', {...})
  if (!response.ok) throw new Error(`API responded with status: ${response.status}`)
  // ... success handling
} catch (error) {
  console.error('Error generating quiz:', error)
  toast.error('Quiz generation failed. You can regenerate it later.')
  // Job creation still succeeds!
}
```

**Benefits:**
- ✅ Job creation never fails due to quiz generation
- ✅ Clear error messages to users
- ✅ Option to retry later
- ✅ Detailed logging for debugging

### Database Failures
```javascript
const { error: updateError } = await supabase.from('jobs').update(...)
if (updateError) throw updateError
```

**Handling:**
- Shows error toast
- Logs error details
- Allows retry via regenerate button

---

## 📊 Database Schema

### `jobs` Table - `custom_fields` Column (JSONB)

```json
{
  "department": "Frontend Development",
  "quiz_config": {
    "difficulty": "medium",
    "duration": "60",
    "topics": ["javascript", "react", "nodejs"],
    "custom_questions": "",
    "weightage": 40,
    "passing_score": 70
  },
  "generated_quiz": {
    "quiz_id": "quiz_junior_front_end_developer_f858c5ba",
    "metadata": {
      "question_count": 15,
      "level": "Mid Level"
    },
    "questions": [
      {
        "question": "You're building a React component...",
        "options": [
          {"letter": "A", "text": "React.memo..."},
          {"letter": "B", "text": "React.memo..."},
          {"letter": "C", "text": "useMemo..."},
          {"letter": "D", "text": "useCallback..."}
        ],
        "correct_answer": "A"
      }
      // ... more questions
    ],
    "generated_at": "2025-01-07T12:34:56.789Z"
  }
}
```

**Advantages:**
- ✅ All quiz data stored with the job
- ✅ Easy to access for candidate portal
- ✅ Version control (can see generation date)
- ✅ No additional tables needed
- ✅ JSONB allows flexible querying

---

## 🎨 UI Components

### Settings Tab - Quiz Management Card

**When Quiz Exists:**
```
┌─────────────────────────────────────────┐
│ Quiz Management                          │
│ View and manage the generated quiz       │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Quiz Generated                   │ │
│ │ 15 questions • Mid Level            │ │
│ │ Generated: 1/7/2025                 │ │
│ │                [Regenerate Quiz]    │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Quiz ID                             │ │
│ │ quiz_junior_front_end_developer_... │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**When No Quiz:**
```
┌─────────────────────────────────────────┐
│ Quiz Management                          │
│ View and manage the generated quiz       │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ ⚠️ No Quiz Generated                │ │
│ │ Generate a quiz to enable candidate │ │
│ │ assessments                         │ │
│ │                  [Generate Quiz]    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔄 Next Steps for Candidate Portal

### What's Ready
1. ✅ Quiz data structure
2. ✅ Questions with multiple choice options
3. ✅ Correct answers stored
4. ✅ Metadata (question count, level)

### To Implement
1. **Quiz Taking Interface**
   - Display questions one by one
   - Radio button selection for options
   - Timer based on duration
   - Submit answers

2. **Quiz Results**
   - Calculate score
   - Compare with passing_score
   - Store in `applications` table
   - Show feedback to candidate

3. **Quiz Access Control**
   - Only show to applied candidates
   - Track if already taken
   - Prevent retakes (unless allowed)

### Sample Data Structure for Candidate

```javascript
// Fetch quiz for a job
const { data: job } = await supabase
  .from('jobs')
  .select('custom_fields')
  .eq('id', jobId)
  .single()

const quiz = job.custom_fields.generated_quiz

// Display to candidate
quiz.questions.map(q => ({
  question: q.question,
  options: q.options, // Don't send correct_answer to frontend!
  userAnswer: null
}))

// After submission
const score = calculateScore(userAnswers, quiz.questions)
const passed = score >= job.custom_fields.quiz_config.passing_score
```

---

## 📝 Configuration & Maintenance

### Environment Variables (if needed)
```env
QUIZ_API_URL=http://127.0.0.1:8000/quiz
QUIZ_DEFAULT_QUESTIONS=15
QUIZ_MAX_QUESTIONS=20
```

### Monitoring
- Check quiz generation success rate
- Monitor API response times
- Track regeneration requests
- Log quiz generation failures

### Troubleshooting

**Quiz not generating?**
1. Check API is running at `http://127.0.0.1:8000/quiz`
2. Verify `ai_test_generation` is true
3. Check browser console for errors
4. Verify quiz_config has topics selected

**Quiz data not showing?**
1. Check database `custom_fields.generated_quiz`
2. Verify page reload after generation
3. Check network tab for API call
4. Verify no database update errors

---

## ✅ Testing Checklist

- [x] Create job with AI test generation enabled
- [x] Verify quiz is generated automatically
- [x] Check quiz data stored in database
- [x] View quiz status in Settings tab
- [x] Regenerate quiz successfully
- [x] Handle API failures gracefully
- [x] Create job with AI test generation disabled (no quiz)
- [x] Generate quiz manually from Settings
- [x] Verify quiz ID is unique
- [x] Check question count matches configuration
- [x] Verify difficulty level mapping
- [x] Test with different job types and requirements

---

## 🎯 Summary

### What Was Built
1. ✅ **Auto Quiz Generation** - Quizzes created on job posting
2. ✅ **Manual Regeneration** - Companies can regenerate anytime
3. ✅ **Status Display** - Clear visual indicators
4. ✅ **Error Handling** - Graceful failures
5. ✅ **Data Storage** - Efficient JSONB storage
6. ✅ **API Integration** - Complete FormData submission

### Benefits
- 🚀 **Fast**: Quiz generation is background process
- 🛡️ **Reliable**: Job creation never fails due to quiz
- 🎨 **User-Friendly**: Clear status and actions
- 📊 **Data-Rich**: Complete quiz stored for candidate use
- 🔄 **Flexible**: Easy to regenerate if needed

### Ready For
- ✅ Production deployment
- ✅ Candidate portal integration
- ✅ Quiz taking functionality
- ✅ Results tracking and scoring

---

**Implementation Complete! 🎉**

The quiz generation system is fully functional and ready for candidate-facing features.

