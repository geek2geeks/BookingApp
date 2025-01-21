# Presentation Booking System

A Next.js application designed for managing student presentation bookings. This system allows students to book 20-minute presentation slots across three weekends, with both morning and afternoon sessions available.

## Features

### Time Slot Management
- **Three Weekend Options**: Available slots spread across three weekends
- **Two Sessions Per Day**: 
  - Morning Session: 10:10 AM - 1:00 PM
  - Afternoon Session: 2:10 PM - 5:00 PM
- **20-Minute Slots**: Each presentation slot is exactly 20 minutes
- **5-Minute Breaks**: Automatic 5-minute breaks between presentations

### Booking Process
1. **Week Selection**
   - View all three available weekends
   - See total available slots per weekend
   - Past weeks are automatically disabled

2. **Day Selection**
   - Choose between Saturday or Sunday
   - View availability for each day
   - See session types (morning/afternoon)
   - Past days are automatically disabled

3. **Time Slot Selection**
   - Visual grid of all available time slots
   - Clear distinction between:
     - Available slots (green)
     - Booked slots (yellow)
     - Past slots (gray)
   - Separate morning and afternoon sessions

4. **Booking Details**
   - Required information:
     - Full Name
     - Student Number (8 digits)
   - Optional information:
     - Company Name
     - Additional Notes (max 20 characters)

### Booking Management
- **Unique Booking Codes**: Each booking receives a 4-digit code
- **Modification Options**:
  - Update company information
  - Add/modify notes
  - Cancel booking (up until the day before)
- **Cancellation Rules**: 
  - Cannot cancel on the presentation day
  - Cannot cancel past presentations

## Technical Details

### Built With
- Next.js 14 with App Router
- TypeScript for type safety
- Prisma as ORM
- SQLite database
- Tailwind CSS for styling
- Zustand for state management
- React Hook Form for form handling
- Zod for schema validation
- shadcn/ui components

### Key Features
- Dark/Light theme support
- Responsive design
- Real-time availability updates
- Form validation
- Error handling
- Loading states
- Accessibility features

## Getting Started

### Prerequisites
- Node.js 18.17 or higher
- npm or yarn package manager

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd presentation-booking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Create a .env file:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables
- `DATABASE_URL`: SQLite database URL (required)

## Database Schema

### Booking Model
```prisma
model Booking {
  id            String   @id @default(cuid())
  code          String   @unique
  name          String
  studentNumber String
  company       String?
  notes         String?
  slot          String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([code])
  @@index([slot])
}
```

## API Routes

### Bookings
- `GET /api/bookings`: List all bookings
- `POST /api/bookings`: Create a new booking
- `GET /api/bookings/[code]`: Get booking details
- `PATCH /api/bookings/[code]`: Update booking
- `DELETE /api/bookings/[code]`: Cancel booking

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details