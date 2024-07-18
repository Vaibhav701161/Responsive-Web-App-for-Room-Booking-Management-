// script.js

const rooms = {
    'G1': [], 'G2': [], 'G3': [], 'G4': [], 'G5': [], 'G6': [], 'G7': [], 'G8': [], 'G9': [], 'G10': [],
    '101': [], '102': [], '103': [], '104': [], '105': [], '106': [], '107': [], '108': [], '109': [], '110': [], '111': [],
    '201': [], '202': [], '203': [], '204': [], '205': [], '206': [], '207': [], '208': [], '209': [], '210': [], '211': [],
    '301': [], '302': [], '303': []
};

const unavailableRooms = ['G2', 'G5', 'G6', '104', '105', '107', '109'];

// DOM elements
const roomGrid = document.getElementById('room-grid');
const roomSelect = document.getElementById('room-select');
const newBookingForm = document.getElementById('new-booking-form');
const availableRoomsList = document.getElementById('available-rooms-list');
const unallocatedRoomsList = document.getElementById('unallocated-rooms-list');

// Helper functions
const createElementWithClass = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
};

// Update functions
const updateRoomGrid = () => {
    roomGrid.innerHTML = '';
    Object.entries(rooms).forEach(([room, bookings]) => {
        const roomDiv = createElementWithClass('div', 'room');
        roomDiv.innerHTML = `<h3>${room}</h3>`;
        
        const bookingList = createElementWithClass('div', 'room-info');
        bookings.forEach(booking => {
            const bookingDiv = createElementWithClass('div', 'booking');
            bookingDiv.innerHTML = `
                <strong>${booking.guestName}</strong>
                <p>Room Type: ${booking.roomType}</p>
                <p>Check-In: ${formatDate(booking.checkIn)}</p>
                <p>Check-Out: ${formatDate(booking.checkOut)}</p>
                <p>WhatsApp: ${booking.phoneNumber}</p>
            `;
            bookingList.appendChild(bookingDiv);
        });
        roomDiv.appendChild(bookingList);
        roomGrid.appendChild(roomDiv);
    });
    updateRoomSummary();
};

const updateRoomSummary = () => {
    const totalRooms = Object.keys(rooms).length;
    const occupiedRooms = Object.values(rooms).filter(bookings => bookings.length > 0).length;
    const availableRoomsCount = totalRooms - occupiedRooms - unavailableRooms.length;

    document.getElementById('available-rooms').textContent = availableRoomsCount;
    document.getElementById('occupied-rooms').textContent = occupiedRooms;
    document.getElementById('unavailable-rooms').textContent = unavailableRooms.length;

    updateAvailableRooms();
    updateUnavailableRooms();
};

const updateAvailableRooms = () => {
    availableRoomsList.innerHTML = '';
    Object.keys(rooms)
        .filter(room => !unavailableRooms.includes(room) && rooms[room].length === 0)
        .forEach(room => {
            const li = document.createElement('li');
            li.textContent = room;
            availableRoomsList.appendChild(li);
        });
};

const updateUnavailableRooms = () => {
    unallocatedRoomsList.innerHTML = '';
    unavailableRooms.forEach(room => {
        const li = document.createElement('li');
        li.textContent = room;
        unallocatedRoomsList.appendChild(li);
    });
};

const populateRoomSelect = () => {
    roomSelect.innerHTML = '';
    Object.keys(rooms)
        .filter(room => !unavailableRooms.includes(room))
        .forEach(room => {
            const option = document.createElement('option');
            option.value = room;
            option.textContent = room;
            roomSelect.appendChild(option);
        });
};

// API functions
const fetchBookings = async () => {
    try {
        console.log('Fetching bookings...');
        const response = await fetch('/api/bookings');
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bookings = await response.json();
        console.log('Fetched bookings:', bookings);
        bookings.forEach(booking => {
            if (rooms[booking.room]) {
                rooms[booking.room].push(booking);
            }
        });
        updateRoomGrid();
    } catch (error) {
        console.error('Error fetching bookings:', error);
        alert('Failed to fetch bookings. Please try again later.');
    }
};

const addBooking = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(newBookingForm);
    const booking = Object.fromEntries(formData.entries());
    booking.checkInMeter = parseInt(booking.checkInMeter);
    booking.checkOutMeter = booking.checkOutMeter ? parseInt(booking.checkOutMeter) : null;

    const maxRetries = 3;
    let currentRetry = 0;

    const saveBooking = async () => {
        try {
            console.log('Sending booking:', booking);
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(booking),
            });

            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Booking created:', result);
            
            if (!rooms[booking.room]) {
                rooms[booking.room] = [];
            }
            rooms[booking.room].push(booking);
            
            updateRoomGrid();
            newBookingForm.reset();
            alert('Booking created successfully!');
        } catch (error) {
            console.error('Error creating booking:', error);
            if (currentRetry < maxRetries) {
                currentRetry++;
                console.log(`Retrying (${currentRetry}/${maxRetries})...`);
                await saveBooking();
            } else {
                alert('Failed to create booking after multiple attempts. Please try again later.');
            }
        }
    };

    await saveBooking();
};

// Event listeners
newBookingForm.addEventListener('submit', addBooking);

// Initialization
const initializeApp = () => {
    populateRoomSelect();
    fetchBookings();
};





// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);

