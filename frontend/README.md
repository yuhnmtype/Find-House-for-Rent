# Find House for Rent — Frontend

This is the frontend for the Find House for Rent web application, a platform that connects students in Ho Chi Minh City with landlords offering rooms, apartments and houses. It is built with plain HTML, CSS and JavaScript using Bootstrap 5, and it talks to the project's Express/Prisma backend over a REST API.

## Tech stack

The frontend uses no build step. It is plain HTML, CSS and vanilla JavaScript, styled with Bootstrap 5 and Bootstrap Icons loaded from a CDN. Fonts are Fraunces and Plus Jakarta Sans from Google Fonts. All data is loaded at runtime from the backend through the Fetch API. Authentication uses a JWT token stored in the browser's localStorage.

## Pages

The application has seven pages. index.html is the public home page with search, filtering and a paginated grid of available houses. house.html shows the full detail of one house and lets a logged-in student send a booking request. login.html and register.html handle authentication for students and landlords. student.html is the student dashboard covering bookings, saved houses, recently viewed houses, recommendations, contracts and profile. landlord.html is the landlord dashboard covering listings, listing creation and editing, incoming booking requests, contract creation and payments. staff.html is the staff administration dashboard covering platform statistics, users, all listings, all bookings and all payments.

## Extra features

Students can save houses to a favorites list by tapping the heart on any listing card or on the house detail page, and review them under the Saved tab. A Recently viewed tab lists houses the student has opened. A Recommended tab requests suggestions from the backend recommendation endpoint, shown with a short reason for each suggestion. A housing-assistant chat widget is available on the main pages: it sends a question to the backend assistant endpoint and displays the reply. The chat widget is a plain text box that posts a message and renders the response, so the frontend portion uses only standard form handling and fetch.

## Folder structure

```
frontend/
  index.html
  house.html
  login.html
  register.html
  student.html
  landlord.html
  staff.html
  assets/
    css/
      styles.css
    js/
      config.js
      auth.js
      api.js
      ui.js
      pages/
        index.js
        house.js
        login.js
        register.js
        student.js
        landlord.js
        landlord-requests.js
        staff.js
        dashboard-common.js
```

The four files in assets/js form the shared engine. config.js holds the API base URL and the option lists for districts, house types, interiors and amenities. auth.js manages the session, role guards and logout. api.js is a small wrapper around fetch that attaches the token, parses JSON and turns backend errors into readable messages. ui.js renders the navbar and footer, formats currency and dates, builds status badges, and shows toast notifications. The files under assets/js/pages each drive one page.

## Configuration

The backend address is set in assets/js/config.js by the API_ORIGIN constant. It defaults to http://localhost:3000. If the backend runs on a different host or port, this value is the only thing that needs to change.

## Running locally

The backend must be running first. With the backend started on port 3000, the frontend is served as static files. I open the frontend folder in VS Code and use the Live Server extension, which serves the pages at http://127.0.0.1:5500. Any static file server works equally well.

For the browser to be allowed to call the backend, the backend's FRONTEND_URL environment variable must match the address the frontend is served from. When using Live Server that address is http://127.0.0.1:5500.

## Demo accounts

The backend seed script creates several accounts, all with the password password123. The staff account is staff@findhousehcmc.vn. A landlord account is landlord1@gmail.com. A student account is student1@student.hcmut.edu.vn.

## How the roles work

A student browses and filters listings, opens a house, sends a booking request with an optional visit date and message, and tracks requests and contracts from the student dashboard. A landlord posts listings with photos and details, edits them, sets their status, reviews incoming booking requests, approves or rejects them, creates a rental contract once a request is approved, and views platform listing fees. Staff oversee the whole platform: viewing statistics, activating or deactivating user accounts, removing listings, and generating and reviewing monthly listing fees.

## Notes on the API integration

Every API path, field name and response shape used by the frontend was checked against the backend controllers. A few points worth recording. House images and amenities are stored by the backend as JSON strings and returned as arrays, so listing creation sends amenities as a JSON string inside multipart form data. The landlord has no single endpoint for all incoming bookings, so the booking requests view loads the landlord's houses first and then fetches the bookings for each house and merges them. House status changes from the landlord are limited to AVAILABLE, RENTED and INACTIVE, because PENDING is set by the system when a booking arrives. Profile updates use the auth endpoints rather than the user endpoints.

## Credits

Bootstrap 5 and Bootstrap Icons by the Bootstrap team. Fraunces and Plus Jakarta Sans fonts via Google Fonts. Built for the Web Application Development final project at International University, VNU HCMC.
