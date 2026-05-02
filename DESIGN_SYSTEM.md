# Neo Nexor LMS - Complete Design System Documentation

> **AI-Assisted Learning Management System Frontend Design System**
>
> This document provides a comprehensive reference for the UI/UX design system used in the Neo Nexor LMS platform. It can be used as inspiration to recreate similar frontend designs in any framework or technology stack.

---

## Table of Contents

1. [Component Architecture](#1-component-architecture)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Layout Patterns](#5-layout-patterns)
6. [UI Features](#6-ui-features)
7. [Icons & Visual Assets](#7-icons--visual-assets)
8. [Interactive States](#8-interactive-states)
9. [Animation & Motion](#9-animation--motion)
10. [Component Libraries](#10-component-libraries)
11. [Styling Approach](#11-styling-approach)
12. [Responsive Design](#12-responsive-design)

---

## 1. Component Architecture

### Form Components

#### GenerateForm
**Purpose**: AI question generation interface

**Props**:
- `onGenerate` (function): Callback when generation is triggered
- `generating` (boolean): Loading state

**Features**:
- Cascading dropdowns (Subject → Topic)
- Disabled states for dependent fields
- Loading spinner with animation
- Button with icon and text states

**Example**:
```jsx
<GenerateForm
  onGenerate={handleGenerate}
  generating={isGenerating}
/>
```

**File**: `frontend/components/GenerateForm.jsx`

---

#### QuestionEditForm
**Purpose**: Edit MCQ and Short Answer questions

**Props**:
- `question` (object): Question data
- `onSave` (function): Save callback
- `onCancel` (function): Cancel callback

**Features**:
- Dynamic form fields based on question type
- Radio button selection for MCQ correct answer
- Add/remove options (2-6 options)
- Validation with error messages
- Auto-labeled options (A, B, C, D...)

**Example**:
```jsx
<QuestionEditForm
  question={selectedQuestion}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

**File**: `frontend/components/QuestionEditForm.jsx`

---

### Card Components

#### QuestionCard
**Purpose**: Display question with expand/collapse

**Props**:
- `question` (object): Question data
- `onPublish` (function): Publish callback
- `onReject` (function): Reject callback
- `onUpdate` (function): Update callback

**Features**:
- Expandable/collapsible content
- Status badges (draft, published, rejected)
- Type badges (MCQ, Short Answer)
- Hover effects on border
- Action buttons for draft questions
- Highlighted correct answer for MCQs

**Example**:
```jsx
<QuestionCard
  question={question}
  onPublish={handlePublish}
  onReject={handleReject}
  onUpdate={handleUpdate}
/>
```

**File**: `frontend/components/QuestionCard.jsx`

---

### Modal/Sheet Components

#### SlideOutSheet
**Purpose**: Right-side slide-out panel

**Props**:
- `isOpen` (boolean): Open state
- `onClose` (function): Close callback
- `title` (string): Sheet title
- `children` (node): Sheet content
- `width` (string): Sheet width (default: '600px')

**Features**:
- Slide-in animation from right (300ms)
- Backdrop with blur effect
- Escape key to close
- Body scroll lock when open
- Responsive max-width (90vw)

**Example**:
```jsx
<SlideOutSheet
  isOpen={isSheetOpen}
  onClose={() => setIsSheetOpen(false)}
  title="Edit Question"
  width="700px"
>
  <QuestionEditForm {...props} />
</SlideOutSheet>
```

**File**: `frontend/components/SlideOutSheet.jsx`

---

#### StudentSelectModal
**Purpose**: Student selection modal (demo mode)

**Props**:
- `isOpen` (boolean): Open state
- `onClose` (function): Close callback

**Features**:
- Search functionality
- Loading state with spinner
- Click outside to close
- List hover effects

**File**: `frontend/components/StudentSelectModal.jsx`

---

#### QuestionDrawer
**Purpose**: Answer question interface

**Props**:
- `isOpen` (boolean): Open state
- `onClose` (function): Close callback
- `question` (object): Question data
- `onSubmit` (function): Submit callback

**Features**:
- Full-height drawer
- MCQ radio button selection
- Textarea for short answers
- Success/error states
- Auto-close after submission

**File**: `frontend/components/QuestionDrawer.jsx`

---

#### SubmissionDetailSheet
**Purpose**: View submission details with grading

**Props**:
- `submission` (object): Submission data
- `scores` (object): Scores data
- `onScoreChange` (function): Score change callback

**Features**:
- MCQ answer comparison
- AI analysis display
- Score input field
- Visual highlighting for correct/incorrect answers

**File**: `frontend/components/SubmissionDetailSheet.jsx`

---

#### SolutionSheet
**Purpose**: Generate and view solutions

**Props**:
- `questionId` (string): Question ID
- `onClose` (function): Close callback
- `onUpdate` (function): Update callback

**Features**:
- Generate solution button
- Step-by-step solution display
- Publish/unpublish functionality
- Loading and error states

**File**: `frontend/components/SolutionSheet.jsx`

---

#### StudentSolutionViewer
**Purpose**: Student view of published solutions

**Props**:
- `questionId` (string): Question ID

**Features**:
- Read-only solution display
- Step-by-step format
- Unavailable state messaging

**File**: `frontend/components/StudentSolutionViewer.jsx`

---

### Dropdown Components

#### QuestionSelectorDropdown
**Purpose**: Searchable question selection dropdown

**Props**:
- `value` (string): Selected value
- `onChange` (function): Change callback
- `label` (string): Dropdown label

**Features**:
- Search functionality
- Click outside to close
- Question preview in dropdown
- Type badges in list
- Keyboard navigation support

**File**: `frontend/components/QuestionSelectorDropdown.jsx`

---

#### NotificationDropdown
**Purpose**: Display notifications list

**Props**:
- `userId` (string): User ID
- `userType` (string): User type (teacher/student)
- `onClose` (function): Close callback
- `onMarkAsRead` (function): Mark as read callback

**Features**:
- Unread indicator dots
- Time ago formatting
- Mark all as read
- Click to navigate
- Loading and empty states

**File**: `frontend/components/NotificationDropdown.jsx`

---

### Notification Components

#### NotificationBell
**Purpose**: Notification bell icon with badge

**Props**:
- `userId` (string): User ID
- `userType` (string): User type

**Features**:
- Polling every 10 seconds
- Animated ping effect for new notifications
- Badge count (9+ for high numbers)
- Toast notifications for new alerts
- Dropdown toggle

**File**: `frontend/components/NotificationBell.jsx`

---

## 2. Color System

### Primary Color Palette

```css
/* Backgrounds */
--bg-primary: #0f1117          /* Main background - very dark blue/black */
--bg-secondary: #1a1f2e        /* Card background - dark blue */
--bg-tertiary: #0f1117         /* Input background - darkest */

/* Borders */
--border-primary: #2d3748      /* Default borders */
--border-secondary: #1e2535    /* Lighter borders */
--border-hover: #3d4f6e        /* Hover borders */
```

### Accent Colors

```css
/* Teacher Theme - Green/Mint */
--accent-teacher: #6ee7b7              /* Primary green/mint */
--accent-teacher-hover: #a7f3d0        /* Light green hover */
--accent-teacher-bg: rgba(110, 231, 183, 0.1)  /* 10% opacity */
--accent-teacher-border: rgba(110, 231, 183, 0.4)  /* 40% opacity */

/* Student Theme - Purple/Violet */
--accent-student: #a78bfa              /* Primary purple */
--accent-student-hover: #c4b5fd        /* Light purple hover */
--accent-student-bg: rgba(167, 139, 250, 0.1)  /* 10% opacity */
--accent-student-border: rgba(167, 139, 250, 0.4)  /* 40% opacity */
```

### Semantic Colors

```css
/* Success */
--success: #6ee7b7                     /* Green for success */
--success-bg: rgba(110, 231, 183, 0.1) /* Success background */
--success-border: rgba(110, 231, 183, 0.3) /* Success border */

/* Error */
--error: #f87171                       /* Red for errors */
--error-bg: rgba(248, 113, 113, 0.1)   /* Error background */
--error-border: rgba(248, 113, 113, 0.3) /* Error border */
--error-hover: rgba(248, 113, 113, 0.9) /* Error hover */

/* Warning */
--warning: #fbbf24                     /* Yellow/amber for warnings */
--warning-bg: rgba(251, 191, 36, 0.1)  /* Warning background */
--warning-border: rgba(251, 191, 36, 0.3) /* Warning border */

/* Info */
--info-blue: #60a5fa                   /* Blue for info */
--info-blue-bg: rgba(96, 165, 250, 0.1) /* Blue background */
--info-purple: #a78bfa                 /* Purple for info */
--info-purple-bg: rgba(167, 139, 250, 0.1) /* Purple background */
```

### Text Colors

```css
/* Primary Text */
--text-primary: #ffffff                /* White headings */
--text-secondary: #e2e8f0              /* Light gray body text */
--text-tertiary: #94a3b8               /* Muted text */
--text-quaternary: #4a5568             /* Very muted text */
--text-disabled: #2d3748               /* Disabled text */

/* Accent Text */
--text-accent-teacher: #6ee7b7         /* Teacher accent */
--text-accent-student: #a78bfa         /* Student accent */
```

### Type Badge Colors

```css
/* MCQ Type */
--type-mcq-text: #60a5fa               /* Blue */
--type-mcq-bg: rgba(96, 165, 250, 0.1)

/* Short Answer Type */
--type-short-text: #a78bfa             /* Purple */
--type-short-bg: rgba(167, 139, 250, 0.1)

/* Status Badges */
--status-draft: #fbbf24                /* Yellow */
--status-draft-bg: rgba(251, 191, 36, 0.1)
--status-published: #6ee7b7            /* Green */
--status-published-bg: rgba(110, 231, 183, 0.1)
--status-rejected: #f87171             /* Red */
--status-rejected-bg: rgba(248, 113, 113, 0.1)
--status-flagged: #fbbf24              /* Yellow */
--status-flagged-bg: rgba(251, 191, 36, 0.1)
```

### Color Usage Examples

```jsx
// Backgrounds
<div className="bg-[#0f1117]">        {/* Main background */}
<div className="bg-[#1a1f2e]">        {/* Card background */}

// Borders
<div className="border border-[#2d3748]">  {/* Default border */}
<div className="hover:border-[#3d4f6e]">   {/* Hover border */}

// Text
<h1 className="text-white">           {/* Headings */}
<p className="text-[#e2e8f0]">        {/* Body text */}
<span className="text-[#94a3b8]">     {/* Muted text */}

// Teacher Accent (Green)
<button className="bg-[#6ee7b7] text-[#0f1117]">
<div className="border-[#6ee7b7]/40">

// Student Accent (Purple)
<button className="bg-[#a78bfa] text-[#0f1117]">
<div className="border-[#a78bfa]/40">

// Status Colors
<div className="bg-[#6ee7b7]/10 text-[#6ee7b7]">    {/* Success */}
<div className="bg-red-500/10 text-red-400">         {/* Error */}
<div className="bg-yellow-400/10 text-yellow-400">   {/* Warning */}
```

---

## 3. Typography

### Font Family

**Primary Font**: System default sans-serif
- No custom font loaded
- Uses browser's default sans-serif font
- Clean, modern, native feel

**Monospace Font**: System monospace
- Used for labels, badges, and technical text
- `font-mono` in Tailwind

**No External Fonts**: Google Fonts or custom font files are NOT used

### Font Sizes

```css
/* Display */
text-5xl        /* 48px - Hero titles, large displays */
text-4xl        /* 36px - Page titles */

/* Headings */
text-2xl        /* 24px - Section headers */
text-lg         /* 18px - Card titles */
text-base       /* 16px - Subsection headers */

/* Body */
text-sm         /* 14px - Default body text */
text-xs         /* 12px - Small body, labels */
text-[10px]     /* 10px - Tiny labels */

/* Mono/Technical */
font-mono text-xs    /* 12px - Mono text */
font-mono text-[10px] /* 10px - Small mono */
```

### Font Weights

```css
font-normal     /* 400 - Regular body text */
font-medium     /* 500 - Emphasized text */
font-semibold   /* 600 - Subheadings */
font-bold       /* 700 - Headings, important text */
```

### Line Heights

```css
leading-tight        /* Tighter line height for headings */
leading-relaxed      /* Relaxed line height for body text */
leading-snug         /* Default line height */
```

### Letter Spacing

```css
tracking-[0.3em]     /* Widest spacing - logo text */
tracking-widest      /* Wide spacing - labels, badges */
tracking-normal      /* Normal spacing - body text */
tracking-tight       /* Tight spacing - headings */
```

### Typography Examples

```jsx
// Page Header
<h1 className="text-4xl font-bold tracking-tight text-white">
  Question Bank
</h1>

// Section Label (Brand/Category)
<p className="text-xs font-mono uppercase tracking-widest text-[#6ee7b7]">
  NEO NEXOR LMS · AI TOOLS
</p>

// Subsection Header
<h2 className="text-2xl font-semibold text-white mb-4">
  Generated Questions
</h2>

// Card Title
<h3 className="text-lg font-semibold text-white mb-2">
  Question Title
</h3>

// Body Text
<p className="text-sm text-[#e2e8f0] leading-relaxed">
  AI-Powered Learning Management System for modern education.
</p>

// Muted Text
<p className="text-sm text-[#94a3b8]">
  No questions yet
</p>

// Badge/Label
<span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-400/10 text-blue-400">
  MCQ
</span>

// Technical/Code
<code className="font-mono text-xs text-[#94a3b8]">
  question_id_123
</code>
```

### Typography Hierarchy

```
Level 1: text-4xl font-bold tracking-tight text-white
Level 2: text-2xl font-semibold text-white
Level 3: text-lg font-semibold text-white
Level 4: text-base font-medium text-white
Body:   text-sm text-[#e2e8f0]
Muted:  text-sm text-[#94a3b8]
Tiny:   text-xs text-[#4a5568]
```

---

## 4. Spacing System

### Spacing Scale (Tailwind-based)

```css
/* Tailwind spacing units */
spacing-1: 0.25rem   /* 4px */
spacing-2: 0.5rem    /* 8px */
spacing-3: 0.75rem   /* 12px */
spacing-4: 1rem      /* 16px */
spacing-5: 1.25rem   /* 20px */
spacing-6: 1.5rem    /* 24px */
spacing-8: 2rem      /* 32px */
spacing-10: 2.5rem   /* 40px */
spacing-12: 3rem     /* 48px */
```

### Common Spacing Patterns

```jsx
// Card Padding
<div className="p-6">          {/* 24px all around */}

// Section Gaps
<div className="gap-3">        {/* 12px between items */}
<div className="gap-4">        {/* 16px between cards */}
<div className="gap-6">        {/* 24px between sections */}

// Margins
<div className="mb-4">         {/* 16px bottom margin */}
<div className="mb-8">         {/* 32px bottom margin */}
<div className="mb-10">        {/* 40px bottom margin (sections) */}

// Form Spacing
<label className="mb-1.5">    {/* 12px below label */}
<input className="py-2.5">    {/* 10px vertical padding */}

// Button Padding
<button className="px-4 py-1.5">   {/* Small: 16px h, 6px v */}
<button className="px-6 py-2.5">   {/* Default: 24px h, 10px v */}
<button className="px-6 py-3">     {/* Large: 24px h, 12px v */}

// Badge Padding
<span className="px-2 py-0.5">     {/* 8px h, 2px v */}

// Grid Gaps
<div className="grid gap-4">       {/* 16px gaps */}
<div className="grid gap-6">       {/* 24px gaps */}
```

### Spacing by Component

```jsx
// Page Container
<main className="p-8">             {/* 32px padding */}

// Card
<div className="p-6 gap-4">        {/* 24px padding, 16px gaps */}

// Form Group
<div className="mb-4">             {/* 16px bottom */}
<label className="mb-1.5">        {/* 12px bottom */}
<input className="px-4 py-2.5">   {/* 16px h, 10px v */}

// Button Group
<div className="flex gap-3">       {/* 12px between buttons */}

// List Items
<div className="flex items-center gap-3">  {/* 12px gaps */}

// Sidebar
<aside className="py-8 px-4">     {/* 32px v, 16px h */}
```

---

## 5. Layout Patterns

### Container Patterns

```jsx
// Main Page Container
<main className="p-8">
  <div className="max-w-5xl mx-auto">
    {/* Content - centered with max width */}
  </div>
</main>

// Card Container
<div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6">
  {/* Card content */}
</div>

// Full-Width Container
<div className="w-full">
  {/* Full width */}
</div>

// Narrow Container
<div className="max-w-md w-full">
  {/* Modal, form */}
</div>
```

### Grid Systems

```jsx
// Responsive Grid - Stats (4 columns)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 col mobile, 2 tablet, 4 desktop */}
</div>

// Responsive Grid - Cards (2 columns)
<div className="grid md:grid-cols-2 gap-6">
  {/* 1 col mobile, 2 desktop */}
</div>

// Responsive Grid - Actions (3 columns)
<div className="grid md:grid-cols-3 gap-4">
  {/* 1 col mobile, 3 desktop */}
</div>

// Fixed Grid
<div className="grid grid-cols-2 gap-4">
  {/* Always 2 columns */}
</div>
```

### Flexbox Patterns

```jsx
// Horizontal Layout
<div className="flex items-center gap-3">
  {/* Items horizontally aligned with gap */}
</div>

// Space Between
<div className="flex items-center justify-between">
  {/* Items at edges */}
</div>

// Vertical Stack
<div className="flex flex-col gap-2">
  {/* Vertical stack with gaps */}
</div>

// Centered
<div className="flex items-center justify-center">
  {/* Centered horizontally and vertically */}
</div>

// Flex Grow
<div className="flex">
  <div className="flex-1"> {/* Grows to fill */} </div>
  <div className="shrink-0"> {/* Fixed width */} </div>
</div>
```

### Sidebar Layout Pattern

```jsx
<div className="min-h-screen bg-[#0f1117] flex">
  {/* Sidebar - Fixed width */}
  <aside className="w-56 shrink-0 border-r border-[#1e2535] flex flex-col py-8 px-4">
    {/* Logo */}
    {/* Navigation */}
    {/* Footer */}
  </aside>

  {/* Main Content - Flexible */}
  <div className="flex-1 overflow-auto">
    {/* Sticky Header */}
    <div className="sticky top-0 z-40 bg-[#0f1117]/95 backdrop-blur-sm border-b border-[#1e2535] px-6 py-3">
      {/* Header content */}
    </div>

    {/* Page Content */}
    <div>
      {/* Main page content */}
    </div>
  </div>
</div>
```

### Responsive Breakpoints

```css
/* Tailwind Default Breakpoints */
sm: 640px    /* Small devices (landscape phones) */
md: 768px    /* Medium devices (tablets) */
lg: 1024px   /* Large devices (desktops) */
xl: 1280px   /* Extra large devices */
```

### Responsive Patterns

```jsx
// Responsive Text
<h1 className="text-4xl md:text-5xl font-bold">
  {/* 36px mobile, 48px desktop */}
</h1>

// Responsive Spacing
<div className="px-4 py-3 md:px-6 md:py-4">
  {/* Smaller padding on mobile */}
</div>

// Responsive Direction
<div className="flex flex-col sm:flex-row gap-3">
  {/* Vertical mobile, horizontal desktop */}
</div>

// Responsive Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsive columns */}
</div>

// Show/Hide
<div className="hidden md:block">
  {/* Hidden mobile, visible desktop */}
</div>

<div className="block md:hidden">
  {/* Visible mobile, hidden desktop */}
</div>

// Responsive Width
<div className="w-full md:w-auto">
  {/* Full mobile, auto desktop */}
</div>
```

### Sticky Positioning

```jsx
// Sticky Header
<div className="sticky top-0 z-40 bg-[#0f1117]/95 backdrop-blur-sm border-b border-[#1e2535]">
  {/* Stays at top when scrolling */}
</div>

// Sticky Sidebar (not implemented but pattern)
<aside className="sticky top-20 h-[calc(100vh-5rem)]">
  {/* Sticks below header */}
</div>
```

---

## 6. UI Features

### Authentication Flows

**Demo Mode Authentication**
- Role selection (Teacher/Student) on landing page
- Student selection modal for demo access
- Session management via localStorage
- No actual authentication - demo purposes only

**Components**: `HomePage`, `StudentSelectModal`

**Flow**:
1. User lands on home page
2. Selects role (Teacher/Student)
3. If Student: Opens modal to select from demo students
4. Session stored in localStorage
5. Redirected to appropriate dashboard

---

### Data Tables

**Grading Table** (`frontend/app/dashboard/grading/page.jsx`)

**Features**:
- Sortable columns
- Inline editing (score inputs)
- Hover row effects
- Pagination (20 items per page)
- Bulk save functionality
- AI pre-filled scores
- Status badges
- Confidence indicators

**Pattern**:
```jsx
<table className="w-full">
  <thead>
    <tr className="border-b border-[#2d3748]">
      <th className="text-left py-3 px-4">Student</th>
      <th className="text-left py-3 px-4">Answer</th>
      <th className="text-left py-3 px-4">Score</th>
    </tr>
  </thead>
  <tbody>
    {data.map((row) => (
      <tr key={row.id} className="hover:bg-[#1a1f2e]/50 border-b border-[#2d3748]">
        <td className="py-3 px-4">{row.student}</td>
        <td className="py-3 px-4">{row.answer}</td>
        <td className="py-3 px-4">
          <input type="number" value={row.score} />
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

---

### Forms

**Question Generation Form**

**Features**:
- Cascading dropdowns (Subject → Topic)
- Form validation
- Loading states
- Disabled states
- Success/error feedback

**Pattern**:
```jsx
<form onSubmit={handleSubmit}>
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1.5">Subject</label>
    <select
      className="w-full bg-[#0f1117] border border-[#2d3748] rounded-lg px-4 py-2.5"
      value={subject}
      onChange={(e) => setSubject(e.target.value)}
      disabled={generating}
    >
      <option value="">Select Subject</option>
      {subjects.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  </div>

  <button
    type="submit"
    disabled={!subject || !topic || generating}
    className="px-6 py-2.5 bg-[#6ee7b7] text-[#0f1117] rounded-lg font-bold
                   disabled:opacity-40 disabled:cursor-not-allowed"
  >
    {generating ? (
      <>
        <span className="animate-spin">...</span>
        Generating...
      </>
    ) : (
      'Generate Questions'
    )}
  </button>
</form>
```

**Question Edit Form**

**Features**:
- Dynamic fields based on type
- Add/remove options (MCQ)
- Radio button selection for correct answer
- Validation with error messages
- Success/error feedback

**Answer Submission Form**

**Features**:
- MCQ radio selection
- Short answer textarea
- Real-time validation
- Success feedback
- Auto-submit on success

---

### Filtering & Search

**Filter Tabs**

**Pattern**:
```jsx
<div className="flex gap-2 mb-6">
  {['draft', 'published', 'rejected'].map((status) => (
    <button
      key={status}
      onClick={() => setFilter(status)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        filter === status
          ? 'bg-[#6ee7b7] text-[#0f1117]'
          : 'bg-[#1a1f2e] text-[#94a3b8] hover:text-white'
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
      {status !== 'all' && (
        <span className="ml-2 px-2 py-0.5 rounded bg-[#0f1117] text-xs">
          {counts[status] || 0}
        </span>
      )}
    </button>
  ))}
</div>
```

**Search Dropdowns**

**Features**:
- Real-time search filtering
- Click outside to close
- Keyboard navigation
- Search highlighting
- Preview content

**Pattern**:
```jsx
<div className="relative">
  {/* Trigger Button */}
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="w-full bg-[#0f1117] border border-[#2d3748] rounded-lg px-4 py-2.5
                   text-left flex items-center justify-between"
  >
    {selectedLabel || 'Select...'}
    <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
  </button>

  {/* Dropdown */}
  {isOpen && (
    <div className="absolute z-10 w-full mt-1 bg-[#1a1f2e] border border-[#2d3748]
                    rounded-lg shadow-xl max-h-96 overflow-hidden">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#0f1117] border-b border-[#2d3748] px-4 py-2"
      />

      {/* Options */}
      <div className="max-h-80 overflow-y-auto">
        {filteredOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option)}
            className="w-full px-4 py-2 hover:bg-[#2d3748] text-left"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )}
</div>
```

---

### Notifications

**Real-time Notifications**

**Features**:
- Polling every 10 seconds
- Toast notifications for new alerts
- Badge count with ping animation
- Unread indicators
- Mark as read functionality
- "Mark all as read" action

**Components**: `NotificationBell`, `NotificationDropdown`

**Pattern**:
```jsx
// Notification Bell with Badge
<div className="relative">
  <button onClick={() => setShowDropdown(!showDropdown)}>
    <svg className="w-6 h-6">{/* Bell icon */}</svg>

    {/* Badge */}
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs
                     rounded-full w-5 h-5 flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}

    {/* Ping Animation for New Notifications */}
    {hasNew && (
      <span className="animate-ping absolute inline-flex h-full w-full
                     rounded-full bg-[#a78bfa] opacity-75"></span>
    )}
  </button>

  {/* Dropdown */}
  {showDropdown && (
    <NotificationDropdown
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  )}
</div>
```

**Polling Pattern**:
```jsx
useEffect(() => {
  // Initial fetch
  fetchNotifications();

  // Poll every 10 seconds
  const interval = setInterval(fetchNotifications, 10000);

  return () => clearInterval(interval);
}, [userId]);
```

---

### Pagination

**Table Pagination**

**Features**:
- Page numbers display
- Previous/Next buttons
- Disabled states for boundaries
- Page size limits (20 items per page)

**Pattern**:
```jsx
<div className="flex items-center justify-center gap-2 mt-6">
  <button
    onClick={() => setPage(page - 1)}
    disabled={page === 1}
    className="px-4 py-2 border border-[#2d3748] rounded-lg
                   disabled:opacity-40 disabled:cursor-not-allowed
                   hover:border-[#6ee7b7]/50 transition-colors"
  >
    ← Previous
  </button>

  <span className="text-sm text-[#94a3b8]">
    Page {page} of {totalPages}
  </span>

  <button
    onClick={() => setPage(page + 1)}
    disabled={page === totalPages}
    className="px-4 py-2 border border-[#2d3748] rounded-lg
                   disabled:opacity-40 disabled:cursor-not-allowed
                   hover:border-[#6ee7b7]/50 transition-colors"
  >
    Next →
  </button>
</div>
```

---

### Loading States

**Spinner Animation**

```jsx
<span className="animate-spin inline-block w-4 h-4
                border-2 border-[#6ee7b7] border-t-transparent rounded-full" />
```

**Skeleton Loading**

```jsx
<div className="animate-pulse h-8 bg-[#2d3748] rounded"></div>
```

**Full-page Loading**

```jsx
<div className="flex items-center justify-center py-16">
  <span className="animate-spin inline-block w-8 h-8
                  border-2 border-[#6ee7b7] border-t-transparent rounded-full" />
  <span className="ml-3 text-[#94a3b8]">Loading...</span>
</div>
```

**Button Loading**

```jsx
<button disabled={loading}>
  {loading ? (
    <>
      <span className="animate-spin inline-block w-4 h-4 mr-2
                      border-2 border-white border-t-transparent rounded-full" />
      Processing...
    </>
  ) : (
    'Submit'
  )}
</button>
```

---

### Empty States

**No Data States**

```jsx
<div className="text-center py-16 text-[#4a5568] font-mono text-sm">
  No {filter} questions yet.
</div>
```

**Empty State with Icon**

```jsx
<div className="text-center py-16">
  <svg className="w-16 h-16 mx-auto mb-4 text-[#4a5568]">
    {/* Empty state icon */}
  </svg>
  <p className="text-[#4a5568] font-mono text-sm">
    No notifications yet
  </p>
</div>
```

---

### Feedback & Alerts

**Success Messages**

```jsx
<div className="px-4 py-3 rounded-lg bg-[#6ee7b7]/10 border border-[#6ee7b7]/30
                text-[#6ee7b7] text-sm">
  ✓ Question published successfully
</div>
```

**Error Messages**

```jsx
<div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30
                text-red-400 text-sm">
  {error}
</div>
```

**Warning Messages**

```jsx
<div className="px-4 py-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30
                text-yellow-400 text-sm">
  ⚠ Please complete all required fields
</div>
```

**Info Messages**

```jsx
<div className="px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30
                text-blue-400 text-sm">
  ℹ AI is analyzing your answer
</div>
```

**Toast Pattern**

```jsx
// Auto-dismissing toast
useEffect(() => {
  if (message) {
    const timer = setTimeout(() => setMessage(''), 5000);
    return () => clearTimeout(timer);
  }
}, [message]);

{message && (
  <div className="fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg
                  bg-[#6ee7b7] text-[#0f1117] font-medium animate-slide-in">
    {message}
  </div>
)}
```

---

### Confirmation Dialogs

**Inline Confirmation**

- Direct action without modal
- Publish/Reject actions
- Immediate feedback
- No undo available

```jsx
<div className="flex gap-2">
  <button
    onClick={() => handlePublish(question.id)}
    className="px-4 py-1.5 border border-[#6ee7b7]/40 text-[#6ee7b7] rounded
                   hover:bg-[#6ee7b7]/10 transition-colors"
  >
    ✓ Publish
  </button>
  <button
    onClick={() => handleReject(question.id)}
    className="px-4 py-1.5 border border-red-500/30 text-red-400 rounded
                   hover:border-red-500/60 transition-colors"
  >
    ✕ Reject
  </button>
</div>
```

---

### Progress Indicators

**Confidence Bar**

```jsx
<div className="flex items-center gap-2">
  <div className="flex-1 h-1.5 bg-[#2d3748] rounded-full overflow-hidden">
    <div
      style={{width: `${confidence}%`}}
      className="h-full bg-[#6ee7b7] rounded-full transition-all duration-300"
    />
  </div>
  <span className="text-xs font-mono text-[#94a3b8]">{confidence}%</span>
</div>
```

**Score Display**

```jsx
<div className="flex items-center gap-2">
  <span className="text-sm text-[#94a3b8]">Score:</span>
  <input
    type="number"
    min="0"
    max="100"
    value={score}
    onChange={(e) => setScore(e.target.value)}
    className="w-20 bg-[#0f1117] border border-[#2d3748] rounded px-3 py-1.5
                   text-center text-sm font-mono
                   focus:border-[#6ee7b7] transition-colors"
  />
  <span className="text-sm text-[#94a3b8]">/ 100</span>
</div>
```

**Progress Steps**

```jsx
<div className="flex items-center gap-2">
  {steps.map((step, index) => (
    <React.Fragment key={index}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
        currentStep >= index
          ? 'bg-[#6ee7b7] text-[#0f1117]'
          : 'bg-[#2d3748] text-[#94a3b8]'
      }`}>
        {currentStep > index ? '✓' : index + 1}
      </div>
      {index < steps.length - 1 && (
        <div className={`flex-1 h-0.5 ${
          currentStep > index ? 'bg-[#6ee7b7]' : 'bg-[#2d3748]'
        }`} />
      )}
    </React.Fragment>
  ))}
</div>
```

---

### Navigation

**Sidebar Navigation**

**Features**:
- Active state highlighting
- Icon indicators
- Hover effects
- Role-based menu items

**Pattern**:
```jsx
<nav className="flex-1">
  {menuItems.map((item) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    transition-colors group ${
          isActive
            ? 'bg-[#6ee7b7]/10 text-[#6ee7b7]'
            : 'text-[#94a3b8] hover:bg-[#1a1f2e] hover:text-white'
        }`}
      >
        <span className={`text-lg ${isActive ? 'text-[#6ee7b7]' : 'text-[#4a5568] group-hover:text-[#6ee7b7] transition-colors'}`}>
          {item.icon}
        </span>
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  })}
</nav>
```

**Breadcrumb-style Navigation**

```jsx
<div className="flex items-center gap-2 text-sm">
  <Link href="/dashboard" className="text-[#94a3b8] hover:text-white">
    Dashboard
  </Link>
  <span className="text-[#4a5568]">/</span>
  <span className="text-white">Questions</span>
</div>
```

**Back Button**

```jsx
<button
  onClick={() => router.back()}
  className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-white transition-colors"
>
  <span>←</span>
  Back
</button>
```

---

## 7. Icons & Visual Assets

### Icon System

**SVG Icons (Inline)**
- No external icon library used
- All icons are inline SVGs
- Heroicons-style icons
- Custom stroke width: 2
- No icon fonts or sprite sheets

**Common Icons**

```jsx
// Close/X Icon
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M6 18L18 6M6 6l12 12" />
</svg>

// Chevron Right
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5l7 7-7 7" />
</svg>

// Chevron Down
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 9l-7 7-7-7" />
</svg>

// Bell/Notification
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
</svg>

// Checkmark
<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd" />
</svg>

// Document/File
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>

// Book/Education
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
</svg>

// User/Person
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
</svg>

// Logout
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
</svg>

// Search
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>

// Plus/Add
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4v16m8-8H4" />
</svg>

// Trash/Delete
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>

// Edit/Pencil
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
</svg>
```

**Unicode/Symbol Icons**

```jsx
// Navigation symbols
◈   // Diamond bullet
◎   // Circle bullet
◉   // Filled circle
◍   // Target
◐   // Half circle
⌂   // Home

// Action symbols
✓   // Check
✕   // Close
✎   // Edit
➕   // Plus
→   // Right arrow
←   // Left arrow
▲   // Up arrow
▼   // Down arrow

// Emoji (minimal use)
📚   // Books/learning
⏳   // Time/loading
📊   // Analytics
⚡   // Fast/quick
```

### Icon Sizes

```jsx
// Extra Small
<svg className="w-3 h-3" />

// Small
<svg className="w-4 h-4" />

// Default/Medium
<svg className="w-5 h-5" />

// Large
<svg className="w-6 h-6" />

// Extra Large
<svg className="w-8 h-8" />

// Hero
<svg className="w-12 h-12" />
```

### Visual Assets

**No External Images**
- No image files used
- All icons are inline SVGs
- No logo image files (text-based logos)
- No illustrations or graphics

**Gradients**
- No gradient backgrounds used
- Solid colors only

**Shadows**

```jsx
// Large shadow
shadow-lg

// Extra large shadow
shadow-2xl

// Custom colored shadow
shadow-[#6ee7b7]/5

// Combination
shadow-xl shadow-[#6ee7b7]/5
```

**Borders**

```jsx
// Default border
border border-[#2d3748]

// Rounded
rounded          // 4px
rounded-lg       // 8px
rounded-xl       // 12px
rounded-2xl      // 16px
rounded-full     // 50% (circle/pill)

// Top/bottom only
border-t border-[#2d3748]
border-b border-[#2d3748]
```

---

## 8. Interactive States

### Button States

**Primary Button (Teacher - Green)**

```jsx
<button className="px-6 py-2.5 bg-[#6ee7b7] text-[#0f1117] rounded-lg text-sm font-bold
                   hover:bg-[#a7f3d0] transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed
                   focus:outline-none">
  Generate Questions
</button>
```

**States**:
- Default: `bg-[#6ee7b7]`
- Hover: `hover:bg-[#a7f3d0]`
- Disabled: `disabled:opacity-40 disabled:cursor-not-allowed`
- Focus: `focus:outline-none` (no ring)

**Primary Button (Student - Purple)**

```jsx
<button className="px-6 py-2.5 bg-[#a78bfa] text-[#0f1117] rounded-lg text-sm font-bold
                   hover:bg-[#c4b5fd] transition-colors">
  Submit Answer
</button>
```

**Secondary Button**

```jsx
<button className="px-4 py-1.5 border border-[#2d3748] text-[#94a3b8] rounded-lg
                   hover:border-[#6ee7b7]/50 hover:text-white transition-colors">
  Cancel
</button>
```

**States**:
- Default: `border-[#2d3748] text-[#94a3b8]`
- Hover: `hover:border-[#6ee7b7]/50 hover:text-white`

**Danger Button**

```jsx
<button className="px-4 py-1.5 border border-red-500/30 text-red-400 rounded-lg
                   hover:border-red-500/60 hover:bg-red-500/10 transition-colors">
  ✕ Reject
</button>
```

**Icon Button**

```jsx
<button className="p-2 hover:bg-[#1a1f2e] rounded-lg transition-colors">
  <svg className="w-5 h-5">{/* icon */}</svg>
</button>
```

---

### Input States

**Text Input**

```jsx
<input
  className="w-full bg-[#0f1117] border border-[#2d3748] rounded-lg px-4 py-2.5
                 text-sm text-white
                 focus:outline-none focus:border-[#6ee7b7] transition-colors
                 placeholder:text-[#4a5568]
                 disabled:opacity-40 disabled:cursor-not-allowed"
  placeholder="Enter text..."
/>
```

**States**:
- Default: `border-[#2d3748]`
- Focus: `focus:border-[#6ee7b7]`
- Error: `border-red-500/50`
- Disabled: `disabled:opacity-40`

**Select Dropdown**

```jsx
<select className="w-full bg-[#0f1117] border border-[#2d3748] rounded-lg px-4 py-2.5
                 text-sm text-white
                 focus:outline-none focus:border-[#6ee7b7] transition-colors
                 appearance-none cursor-pointer
                 disabled:opacity-40">
  <option value="">Select option</option>
</select>
```

**Textarea**

```jsx
<textarea
  className="w-full bg-[#0f1117] border border-[#2d3748] rounded-lg px-4 py-2.5
                 text-sm text-white resize-none
                 focus:outline-none focus:border-[#6ee7b7] transition-colors
                 placeholder:text-[#4a5568]"
  rows="4"
  placeholder="Enter your answer..."
/>
```

**Radio Button**

```jsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="radio"
    name="option"
    value="A"
    className="w-4 h-4 accent-[#6ee7b7]"
  />
  <span className="text-sm text-white">Option A</span>
</label>
```

**States**:
- Default: Standard radio appearance
- Checked: `accent-[#6ee7b7]` (custom accent color)

**Checkbox**

```jsx
<label className="flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="w-4 h-4 accent-[#6ee7b7] rounded"
  />
  <span className="text-sm text-white">Accept terms</span>
</label>
```

---

### Card States

**Default Card**

```jsx
<div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6">
  {/* Card content */}
</div>
```

**Hover Card**

```jsx
<div className="bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6
                hover:border-[#3d4f6e] transition-colors cursor-pointer">
  {/* Card content */}
</div>
```

**States**:
- Default: `border-[#2d3748]`
- Hover: `hover:border-[#3d4f6e]`
- Active/Selected: `border-[#6ee7b7]/50`

**Clickable Card with Shadow**

```jsx
<button className="w-full bg-[#1a1f2e] border border-[#2d3748] rounded-xl p-6
                   hover:border-[#6ee7b7]/50 hover:shadow-lg hover:shadow-[#6ee7b7]/5
                   transition-all text-left">
  {/* Card content */}
</button>
```

**States**:
- Default: Border only
- Hover: Border change + shadow effect

---

### Link States

**Navigation Link**

```jsx
<Link href="/dashboard"
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                 text-[#94a3b8] hover:bg-[#1a1f2e] hover:text-white
                 transition-colors group">
  <span className="text-lg text-[#4a5568] group-hover:text-[#6ee7b7] transition-colors">
    ◈
  </span>
  <span className="font-medium">Dashboard</span>
</Link>
```

**States**:
- Default: `text-[#94a3b8]`
- Hover: `hover:bg-[#1a1f2e] hover:text-white`
- Icon: `text-[#4a5568] group-hover:text-[#6ee7b7]`
- Active: `bg-[#6ee7b7]/10 text-[#6ee7b7]`

**Text Link**

```jsx
<a href="#"
   className="text-[#6ee7b7] hover:underline hover:text-[#a7f3d0] transition-colors">
  View details
</a>
```

**States**:
- Default: `text-[#6ee7b7]`
- Hover: `hover:underline hover:text-[#a7f3d0]`

---

### Badge States

**Type Badge (MCQ)**

```jsx
<span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded
                bg-blue-400/10 text-blue-400">
  MCQ
</span>
```

**Status Badges**

```jsx
// Draft
<span className="px-2 py-0.5 rounded text-xs font-medium
                bg-yellow-400/10 text-yellow-400">
  draft
</span>

// Published
<span className="px-2 py-0.5 rounded text-xs font-medium
                bg-[#6ee7b7]/10 text-[#6ee7b7]">
  published
</span>

// Rejected
<span className="px-2 py-0.5 rounded text-xs font-medium
                bg-red-400/10 text-red-400">
  rejected
</span>
```

**Count Badge**

```jsx
<span className="ml-2 px-2 py-0.5 rounded bg-[#0f1117] text-xs">
  {count}
</span>
```

---

### Dropdown States

**Closed**

```jsx
<div className="relative">
  <button className="w-full bg-[#0f1117] border border-[#2d3748] rounded-lg px-4 py-2.5
                   flex items-center justify-between">
    <span>{selectedValue || 'Select...'}</span>
    <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
  </button>
</div>
```

**Open**

```jsx
<div className="absolute z-10 w-full mt-1 bg-[#1a1f2e] border border-[#2d3748]
                rounded-lg shadow-xl max-h-96 overflow-hidden">
  {/* Dropdown content */}
</div>
```

**Item States**

```jsx
<button className="w-full px-4 py-2 text-left text-sm text-[#e2e8f0]
                   hover:bg-[#2d3748] transition-colors
                   first:rounded-t-lg last:rounded-b-lg last:border-b-0">
  Option 1
</button>
```

**States**:
- Default: `text-[#e2e8f0]`
- Hover: `hover:bg-[#2d3748]`
- Selected: `bg-[#6ee7b7]/10 text-[#6ee7b7]`

---

## 9. Animation & Motion

### Custom Animations

**Slide-in Animation**

**File**: `frontend/app/globals.css`

```css
@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

**Usage**:
```jsx
<div className="animate-slide-in">
  {/* Slide-out sheet content */}
</div>
```

**Fade-in Animation** (can be added)

```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

---

### Tailwind Built-in Animations

**Spin (Loading)**

```jsx
<span className="animate-spin inline-block w-4 h-4
                border-2 border-[#6ee7b7] border-t-transparent rounded-full" />
```

**Pulse (Skeleton Loading)**

```jsx
<div className="animate-pulse h-8 bg-[#2d3748] rounded"></div>
```

**Ping (Notification Badge)**

```jsx
<span className="animate-ping absolute inline-flex h-full w-full
               rounded-full bg-[#a78bfa] opacity-75"></span>
```

**Bounce** (not currently used but available)

```jsx
<span className="animate-bounce inline-block">↓</span>
```

---

### Transition Effects

**Color Transitions**

```jsx
<button className="bg-[#6ee7b7] hover:bg-[#a7f3d0] transition-colors">
  {/* Smooth color change */}
</button>
```

**Transform Transitions**

```jsx
// Horizontal slide on hover
<div className="group-hover:translate-x-1 transition-transform">
  {/* Slides right on hover */}
</div>

// Icon rotation
<svg className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
```

**Border Transitions**

```jsx
<button className="border-[#2d3748] hover:border-[#6ee7b7]/50 transition-colors">
  {/* Border color change */}
</button>
```

**Shadow Transitions**

```jsx
<button className="hover:shadow-lg hover:shadow-[#6ee7b7]/5 transition-all">
  {/* Shadow appearance */}
</button>
```

**All Transitions**

```jsx
<div className="transition-all duration-300">
  {/* All properties transition over 300ms */}
</div>
```

**Backdrop Blur**

```jsx
<div className="bg-black/50 backdrop-blur-sm">
  {/* Frosted glass effect */}
</div>
```

---

### Animation Durations

**Implicit Durations (Tailwind defaults)**
- `transition-colors`: 150ms
- `transition-all`: 150ms
- `transition-transform`: 150ms

**Custom Duration (slide-in)**
- 300ms (0.3s)

**Usage Examples**:
```jsx
// Fast transition
<div className="transition-colors duration-150">

// Medium transition
<div className="transition-all duration-300">

// Slow transition
<div className="transition-transform duration-500">
```

---

### Easing Functions

**Custom**
- `ease-out` (slide-in animation)

**Tailwind Defaults**
- Default: `ease-in-out`
- Color transitions: Default curve

**Usage**:
```jsx
<div className="transition-all ease-out">
<div className="transition-colors ease-in">
<div className="transition-transform ease-in-out">
```

---

### Micro-interactions

**Button Hover**
- Background color change
- Optional: Icon slide

```jsx
<button className="bg-[#6ee7b7] hover:bg-[#a7f3d0] transition-colors">
  Generate Questions
</button>
```

**Card Hover**
- Border color change
- Optional: Shadow appearance

```jsx
<div className="border border-[#2d3748] hover:border-[#3d4f6e] transition-colors">
  {/* Card content */}
</div>
```

**Icon Rotation**
```jsx
<svg className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
  {/* Chevron icon */}
</svg>
```

**Loading States**
- Spinner rotation
- Pulse effect for skeleton
- Opacity changes

```jsx
{loading ? (
  <span className="animate-spin">⟳</span>
) : (
  'Submit'
)}
```

**Notification Badge**
- Ping animation for new notifications
- Continuous pulse effect

```jsx
{hasNew && (
  <span className="animate-ping absolute inline-flex h-full w-full
                 rounded-full bg-[#a78bfa] opacity-75"></span>
)}
```

**Expand/Collapse**
- Smooth content reveal
- Chevron rotation indicator

```jsx
<div>
  <button onClick={() => setExpanded(!expanded)}>
    <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
  </button>
  {expanded && (
    <div className="animate-fade-in">
      {/* Expandable content */}
    </div>
  )}
</div>
```

---

## 10. Component Libraries

### UI Framework

**Next.js 14**

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

**Features Used**:
- App Router (app directory structure)
- Client Components (`'use client'`)
- Server Components (default)
- Link components for navigation
- `useRouter` hook
- `usePathname` hook
- Static metadata
- File-based routing

**File**: `frontend/package.json`

---

### CSS Framework

**Tailwind CSS 3.3.6**

```json
{
  "tailwindcss": "^3.3.6",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.32"
}
```

**Configuration**: `frontend/tailwind.config.js`

```javascript
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},  // No custom theme extensions
  },
  plugins: [],
}
```

**PostCSS Config**: `frontend/postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

### HTTP Client

**Axios 1.6.0**

```json
{
  "axios": "^1.6.0"
}
```

**Usage**: `frontend/lib/fetch.js`

```javascript
import axios from 'axios';

export async function authenticatedFetch(url, options = {}) {
  return axios({
    url,
    method: options.method || 'GET',
    data: options.body,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
```

---

### No External UI Libraries

**NOT Used**:
- ❌ Material-UI (MUI)
- ❌ Chakra UI
- ❌ Ant Design
- ❌ Bootstrap
- ❌ Styled Components
- ❌ Emotion
- ❌ Radix UI
- ❌ Headless UI
- ❌ React Icons
- ❌ Framer Motion
- ❌ Lucide Icons
- ❌ Heroicons (as package - icons are inline SVGs)

**All components are 100% custom-built with Tailwind CSS**

---

## 11. Styling Approach

### Utility-First CSS (Tailwind)

**All styling is done via Tailwind utility classes**

**No**:
- ❌ CSS Modules
- ❌ Styled Components
- ❌ Emotion
- ❌ SASS/SCSS files (except Tailwind base)
- ❌ Custom CSS classes (except animations)

**Yes**:
- ✅ Inline Tailwind classes
- ✅ Custom values in brackets (e.g., `bg-[#1a1f2e]`)
- ✅ Arbitrary values for specific colors/sizes
- ✅ Responsive prefixes (`sm:`, `md:`, `lg:`)
- ✅ State variants (`hover:`, `focus:`, `disabled:`)
- ✅ Group hover states

---

### Global Styles

**File**: `frontend/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@keyframes slide-in {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
```

**Only 2 custom CSS classes**:
1. `@keyframes slide-in`
2. `.animate-slide-in`

Everything else is Tailwind utilities.

---

### Custom Color Usage

**Bracket Notation for Custom Colors**

```jsx
{/* Instead of config-defined colors, use arbitrary values */}
bg-[#0f1117]           {/* Custom hex */}
border-[#2d3748]       {/* Custom hex */}
text-[#6ee7b7]         {/* Custom hex */}
bg-[#6ee7b7]/10        {/* With opacity */}
border-[#6ee7b7]/40    {/* Border with opacity */}
```

**Why bracket notation?**
- No need to modify `tailwind.config.js`
- Self-documenting colors in JSX
- Easy to copy/paste exact values
- No build step for custom colors

---

### Component Patterns

**Client Components**

```jsx
'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  // Interactive component with hooks
}
```

**When to use `'use client'`**:
- Using React hooks (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- Interactive features

---

**Server Components (Default)**

```jsx
// No 'use client' directive
export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f1117]">
      {children}
    </div>
  );
}
```

**When to omit `'use client'`**:
- Static layouts
- Data fetching (server-side)
- No interactivity
- Better performance

---

**Layout Components**

```jsx
// Dashboard layout wrapper
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <aside className="w-56">
        {/* Sidebar */}
      </aside>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

---

### Responsive Design

**Mobile-First Approach**

```jsx
{/* Base: Mobile styles */}
<div className="p-4">
  {/* sm: Tablet */}
  <div className="sm:p-6">
    {/* lg: Desktop */}
    <div className="lg:p-8">
      {/* Content */}
    </div>
  </div>
</div>
```

**Conditional Rendering**

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {/* Responsive columns */}
</div>
```

---

### State-Driven Styling

**Conditional Classes**

```jsx
<button className={`px-4 py-2 rounded ${
  isActive
    ? 'bg-[#6ee7b7] text-[#0f1117]'
    : 'bg-[#1a1f2e] text-white'
}`}>
  {label}
</button>
```

**Template Literals**

```jsx
<div className={`${baseClass} ${isActive && activeClass} ${disabled && disabledClass}`}>
  {/* content */}
</div>
```

**Helper Function Pattern**

```jsx
function getButtonClass(variant, disabled) {
  const base = "px-6 py-2.5 rounded-lg text-sm font-bold transition-colors";

  if (disabled) {
    return `${base} opacity-40 cursor-not-allowed`;
  }

  const variants = {
    primary: "bg-[#6ee7b7] text-[#0f1117] hover:bg-[#a7f3d0]",
    secondary: "border border-[#2d3748] text-[#94a3b8] hover:border-[#6ee7b7]/50 hover:text-white",
    danger: "border border-red-500/30 text-red-400 hover:border-red-500/60"
  };

  return `${base} ${variants[variant]}`;
}

// Usage
<button className={getButtonClass('primary', false)}>
  Click me
</button>
```

---

## 12. Responsive Design

### Breakpoints

```css
/* Tailwind Default Breakpoints */
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
```

**How they work**:
- `sm:` = `@media (min-width: 640px)`
- `md:` = `@media (min-width: 768px)`
- `lg:` = `@media (min-width: 1024px)`
- `xl:` = `@media (min-width: 1280px)`

---

### Responsive Patterns

**Text Scaling**

```jsx
<h1 className="text-4xl md:text-5xl font-bold">
  {/* 36px on mobile, 48px on desktop */}
</h1>

<p className="text-sm md:text-base">
  {/* 14px on mobile, 16px on desktop */}
</p>
```

**Layout Changes**

```jsx
{/* Single column on mobile, multiple on desktop */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsive grid */}
</div>

{/* Stack on mobile, side-by-side on desktop */}
<div className="flex flex-col md:flex-row gap-3">
  {/* Responsive direction */}
</div>
```

**Spacing Adjustments**

```jsx
<div className="px-4 py-3 md:px-6 md:py-4">
  {/* Less padding on mobile */}
</div>

<div className="mb-8 md:mb-10">
  {/* Responsive margins */}
</div>
```

**Show/Hide Elements**

```jsx
<div className="hidden md:block">
  {/* Hidden on mobile, visible on tablet+ */}
</div>

<div className="block md:hidden">
  {/* Visible on mobile only */}
</div>
```

---

### Container Patterns

**Max-Width Containers**

```jsx
<div className="p-8">
  <div className="max-w-5xl mx-auto">
    {/* Centers content with max width on large screens */}
  </div>
</div>

<div className="max-w-6xl mx-auto">
  {/* Wider container */}
</div>

<div className="max-w-md w-full">
  {/* Narrow container for modals */}
</div>
```

---

### Responsive Components

**Cards**

```jsx
{/* Full width on mobile, grid on desktop */}
<div className="grid md:grid-cols-2 gap-6">
  <div className="bg-[#1a1f2e] rounded-xl p-6">
    {/* Card content */}
  </div>
</div>
```

**Tables**

```jsx
{/* Horizontal scroll on mobile */}
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Table content */}
  </table>
</div>
```

**Modals/Sheets**

```jsx
{/* Full width on mobile, fixed width on desktop */}
<div className="w-full max-w-2xl">
  {/* Modal content */}
</div>

{/* Responsive max-width */}
<div style={{ width, maxWidth: '90vw' }}>
  {/* Sheet content */}
</div>
```

**Forms**

```jsx
{/* Stack on mobile, side-by-side on desktop */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
  <div>
    <label>Field 1</label>
    <input />
  </div>
  <div>
    <label>Field 2</label>
    <input />
  </div>
  <div>
    <label>Field 3</label>
    <input />
  </div>
</div>
```

---

### Mobile Optimizations

**Touch-Friendly Targets**

```jsx
{/* Minimum 44x44px for touch */}
<button className="px-6 py-3 min-h-[44px]">
  {/* Large touch target */}
</button>
```

**Readable Text**

```jsx
<p className="text-sm md:text-base">
  {/* 14px minimum on mobile */}
</p>
```

**Simplified Navigation**

```jsx
{/* Desktop sidebar navigation */}
<aside className="w-56 hidden md:flex">
  {/* Nav links */}
</aside>

{/* Mobile: Could use bottom nav or hamburger */}
{/* Current implementation hides sidebar on mobile */}
```

---

### Common Responsive Breakpoints by Use Case

```jsx
// Button sizes
<button className="px-4 py-2 md:px-6 md:py-2.5">
  {/* Smaller on mobile */}
</button>

// Grid layouts
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Progressive enhancement */}
</div>

// Font sizes
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  {/* Progressive scaling */}
</h1>

// Padding/margins
<div className="p-4 sm:p-6 md:p-8 lg:p-10">
  {/* Progressive spacing */}
</div>

// Hide/show
<div className="hidden sm:block">
  {/* Hide on mobile */}
</div>

// Flex direction
<div className="flex flex-col md:flex-row">
  {/* Vertical mobile, horizontal desktop */}
</div>

// Width
<div className="w-full md:w-1/2">
  {/* Full mobile, half desktop */}
</div>
```

---

## Summary & Key Insights

### Design Philosophy

1. **Dark-First Design**: Entire interface is dark mode by default
2. **Minimal & Clean**: Sparse use of decoration, focus on content
3. **Color-Coded Roles**: Green for teachers, purple for students
4. **High Contrast**: Excellent readability with light text on dark backgrounds
5. **Subtle Branding**: "Neo Nexor" brand with tech/mono aesthetic

### Technical Approach

1. **No External UI Libraries**: 100% custom components
2. **Tailwind-Only Styling**: No CSS-in-JS or CSS Modules
3. **Utility-First**: Every style is a Tailwind class
4. **Custom Colors**: Arbitrary hex values in brackets
5. **Next.js App Router**: Modern React patterns

### Component Patterns

1. **Client/Server Split**: Interactive components marked with `'use client'`
2. **Controlled Components**: All form inputs are controlled
3. **Compound Components**: Sheets with headers, content, footers
4. **Render Props**: Children for flexible content
5. **Composition**: Small components composed into larger ones

### Animation Strategy

1. **Minimal Animations**: Only essential motion
2. **Fast Transitions**: 150-300ms for all transitions
3. **Purposeful Loading**: Clear feedback during async operations
4. **No Page Transitions**: Instant navigation

### Accessibility Considerations

1. **Semantic HTML**: Proper button, link, input elements
2. **Focus States**: Visible focus indicators on all interactives
3. **ARIA Labels**: Basic labels on icon-only buttons
4. **Keyboard Navigation**: Escape key closes modals
5. **Color Contrast**: High contrast ratios for readability

### Performance

1. **No Runtime CSS**: Tailwind compiled at build time
2. **Tree Shakeable**: Unused styles purged
3. **Minimal JavaScript**: Only essential React code
4. **Code Splitting**: Next.js automatic splitting
5. **No Large Libraries**: Axios is the only significant dependency

---

## File References

### Key Design System Files

1. **Global Styles**: `frontend/app/globals.css`
2. **Tailwind Config**: `frontend/tailwind.config.js`
3. **PostCSS Config**: `frontend/postcss.config.js`
4. **Next Config**: `frontend/next.config.js`
5. **Package.json**: `frontend/package.json`

### Component Files

**Forms & Inputs**
- `frontend/components/GenerateForm.jsx`
- `frontend/components/QuestionEditForm.jsx`
- `frontend/components/QuestionSelectorDropdown.jsx`

**Cards & Lists**
- `frontend/components/QuestionCard.jsx`

**Modals & Sheets**
- `frontend/components/SlideOutSheet.jsx`
- `frontend/components/StudentSelectModal.jsx`
- `frontend/components/QuestionDrawer.jsx`
- `frontend/components/SubmissionDetailSheet.jsx`
- `frontend/components/SolutionSheet.jsx`

**Notifications**
- `frontend/components/NotificationBell.jsx`
- `frontend/components/NotificationDropdown.jsx`

**Viewers**
- `frontend/components/StudentSolutionViewer.jsx`

### Layout Files

- **Root Layout**: `frontend/app/layout.jsx`
- **Dashboard Layout**: `frontend/app/dashboard/layout.jsx`
- **Teacher Layout**: `frontend/app/teacher/dashboard/layout.jsx`
- **Student Layout**: `frontend/app/student/dashboard/layout.jsx`

### Page Files

- **Landing**: `frontend/app/page.jsx`
- **Questions**: `frontend/app/dashboard/questions/page.jsx`
- **Submissions**: `frontend/app/dashboard/submissions/page.jsx`
- **Grading**: `frontend/app/dashboard/grading/page.jsx`
- **Student Home**: `frontend/app/student/dashboard/home/page.jsx`

### Utility Files

- **HTTP Client**: `frontend/lib/fetch.js`
- **Session Management**: `frontend/lib/session.js`

---

## Usage Guidelines

### How to Use This Design System

1. **Color Palette**: Copy hex values directly to your project
2. **Typography**: Use system fonts with specified sizes and weights
3. **Spacing**: Follow the spacing scale (4px, 8px, 12px, 16px, 24px, 32px)
4. **Components**: Recreate components using your preferred framework
5. **Patterns**: Adapt layout patterns to your technology stack

### Adapting to Other Frameworks

**Vue.js**
- Use Tailwind classes directly
- Convert React hooks to Vue composition API
- Replace `useState` with `ref`/`reactive`
- Keep same component structure

**Svelte**
- Tailwind classes work as-is
- Convert props syntax
- Replace event handlers (`onClick` → `on:click`)
- Keep same design patterns

**Angular**
- Use Tailwind classes in templates
- Convert React components to Angular components
- Use Angular forms instead of controlled inputs
- Keep same color/spacing systems

**Vanilla JS**
- Use Tailwind via CDN
- Recreate components as web components or plain HTML/JS
- Keep same styling approach
- Implement interactivity with vanilla JS

### Customization Tips

1. **Colors**: Replace hex values with your brand colors
2. **Fonts**: Add custom fonts in `globals.css` if needed
3. **Spacing**: Adjust spacing scale in `tailwind.config.js`
4. **Components**: Modify component patterns to match your needs
5. **Animations**: Add custom animations in `globals.css`

---

**End of Design System Documentation**

This document provides a complete reference for recreating the Neo Nexor LMS frontend design in any technology stack. All design decisions, component patterns, and styling approaches are documented for easy reference and implementation.
