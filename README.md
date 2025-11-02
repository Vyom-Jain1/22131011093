# URL Shortener Frontend
live :- https://short-url-v1.onrender.com/

A modern React frontend for the URL Shortener microservice, built with Material-UI for a responsive and intuitive user experience.

## Features

- **URL Shortening**: Shorten up to 5 URLs concurrently with custom shortcodes
- **Real-time Validation**: Client-side validation for URLs and custom shortcodes
- **Copy to Clipboard**: One-click copying of shortened URLs
- **Statistics Dashboard**: View all shortened URLs with click history and metadata
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Material-UI Components**: Modern, accessible UI components

## Tech Stack

- **React 18**: Modern React with hooks and functional components
- **Material-UI (MUI)**: Component library for consistent design
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication

## Project Structure

```
frontend-test-submission/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ShortenPage.js
│   │   └── StatsPage.js
│   ├── App.js
│   ├── index.js
│   └── theme.js
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend-test-submission
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Usage

### Shortening URLs

1. Navigate to the home page
2. Enter a valid URL in the input field
3. Optionally provide a custom shortcode (3-20 characters, alphanumeric)
4. Optionally set an expiration date
5. Click "Shorten URL" to generate the shortened link
6. Use the copy button to copy the shortened URL to clipboard

### Viewing Statistics

1. Click on "View Statistics" in the navigation
2. View all your shortened URLs in a table format
3. See click counts, creation dates, and expiration dates
4. View detailed click history for each URL

## API Integration

The frontend communicates with the backend API endpoints:

- `POST /shorturls` - Create shortened URLs
- `GET /shorturls/:shortcode` - Get URL statistics
- `GET /:shortcode` - Redirect to original URL

## Environment Configuration

The frontend is configured to connect to the backend at `http://localhost:5000`. If your backend runs on a different port, update the API base URL in the components.

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Key Components

- **ShortenPage**: Main URL shortening interface with form validation
- **StatsPage**: Statistics dashboard showing all shortened URLs
- **App**: Main application component with routing and theme setup

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The application includes simulated pre-authorized access
- All API calls include proper error handling
- The UI is optimized for both desktop and mobile usage
- Material-UI theme provides consistent styling across components

