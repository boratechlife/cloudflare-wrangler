
-- First drop junction/child tables
DROP TABLE IF EXISTS Booking_Inventory;
DROP TABLE IF EXISTS Booking_Addons;
DROP TABLE IF EXISTS Booking_Promotions;

-- Drop tables with foreign key dependencies
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Invoices;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS Availability;

DROP TABLE IF EXISTS Rooms;

-- Drop reference tables
DROP TABLE IF EXISTS Addons;
DROP TABLE IF EXISTS Rates;
DROP TABLE IF EXISTS Taxes;
DROP TABLE IF EXISTS Images;
DROP TABLE IF EXISTS Guest;
DROP TABLE IF EXISTS Contact;
DROP TABLE IF EXISTS Promotions;
DROP TABLE IF EXISTS Policies;
DROP TABLE IF EXISTS Groups;

-- Finally drop main tables
DROP TABLE IF EXISTS Hotels;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS HotelRooms;

CREATE TABLE Users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR UNIQUE,
  phone VARCHAR,
  password_hash VARCHAR
);
INSERT INTO Users (first_name, last_name, email, phone, password_hash)
VALUES 
('John', 'Doe', 'john.doe@example.com', '+1234567890', 'hashed_password_1'),
('Jane', 'Smith', 'jane.smith@example.com', '+0987654321', 'hashed_password_2');


--HotelRooms Table

CREATE TABLE HotelRooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    square_feet INTEGER,
    base_price_per_night DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO HotelRooms (name, description, square_feet, base_price_per_night, rating, review_count)
VALUES 
('Standard Room', 'A cozy room with all the basic amenities.', 300, 100.00, 4.0, 10),
('Deluxe Room', 'A spacious room with a beautiful view.', 400, 150.00, 4.5, 15),
('Suite', 'A luxurious suite with separate living and sleeping areas.', 600, 250.00, 5.0, 20);
-- Hotels Table

CREATE TABLE Hotels (
  hotel_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR,
  address VARCHAR,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR,
  star_rating FLOAT,
  description TEXT,
  certification JSON,
  amenities JSON
);
INSERT INTO Hotels (name, address, city, state, country, star_rating, description, certification, amenities)
VALUES 
('Hotel Sunshine', '123 Beach Ave', 'Miami', 'FL', 'USA', 4.5, 'A luxurious beachfront hotel.', '{"green_certified": true}', '{"pool": true, "wifi": true, "gym": true}'),
('Mountain Retreat', '789 Alpine Rd', 'Denver', 'CO', 'USA', 4.0, 'Cozy retreat in the Rockies.', '{"eco_friendly": true}', '{"spa": true, "wifi": true}');

-- Rooms Table

CREATE TABLE Rooms (
  room_id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER,
  room_type TEXT CHECK(room_type IN ('Single', 'Double', 'Deluxe', 'Suite')),
  capacity INTEGER,
  max_capacity INTEGER,
  max_adults INTEGER,
  max_children INTEGER,
  checkin_time VARCHAR,
  checkout_time VARCHAR,
  price DECIMAL,
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);
INSERT INTO Rooms (hotel_id, room_type, capacity, max_capacity, max_adults, max_children, checkin_time, checkout_time, price)
VALUES 
(1, 'Deluxe', 2, 4, 2, 2, '14:00', '11:00', 200.00),
(1, 'Suite', 4, 6, 4, 2, '15:00', '12:00', 350.00),
(2, 'Single', 1, 2, 1, 1, '13:00', '10:00', 100.00);

-- Bookings Table

CREATE TABLE Bookings (
  booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  hotel_id INTEGER,
  room_id INTEGER,
  booking_type TEXT CHECK(booking_type IN ('Day', 'Night', 'Hourly')),
  booking_source JSON,
  start_date DATE,
  end_date DATE,
  date_flexibility BOOLEAN,
  earliest_date DATE,
  latest_date DATE,
  total_price DECIMAL,
  hotel_room_id INTEGER,
  status TEXT CHECK(status IN ('Pending', 'Confirmed', 'Cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_room_id) REFERENCES HotelRooms(id) ON DELETE CASCADE
);

INSERT INTO Bookings (user_id, hotel_id, room_id, booking_type, booking_source, start_date, end_date, date_flexibility, earliest_date, latest_date, total_price, hotel_room_id, status)
VALUES 
(1, 1, 1, 'Night', '{"website": true}', '2025-01-25', '2025-01-26', FALSE, '2025-01-25', '2025-01-26', 200.00, 1, 'Confirmed'),
(2, 2, 3, 'Night', '{"app": true}', '2025-01-26', '2025-01-27', TRUE, '2025-01-25', '2025-01-27', 100.00, 3, 'Pending');

-- Additional Tables

CREATE TABLE Inventory (
  inventory_id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER,
  date DATE,
  availability JSON,
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);
INSERT INTO Inventory (room_id, date, availability)
VALUES 
(1, '2025-01-25', '{"available": true}'),
(2, '2025-01-26', '{"available": false}');


CREATE TABLE Booking_Inventory (
  booking_id INTEGER,
  inventory_id INTEGER,
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_id) REFERENCES Inventory(inventory_id) ON DELETE CASCADE
);
INSERT INTO Booking_Inventory (booking_id, inventory_id)
VALUES 
(1, 1),
(2, 2);


CREATE TABLE Availability (
  room_id INTEGER,
  date DATE,
  available BOOLEAN,
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);
INSERT INTO Availability (room_id, date, available)
VALUES 
(1, '2025-01-25', TRUE),
(2, '2025-01-26', FALSE);


CREATE TABLE Addons (
  addon_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR,
  description TEXT,
  price DECIMAL
);
INSERT INTO Addons (name, description, price)
VALUES 
('Airport Pickup', 'Pickup service from the nearest airport.', 50.00),
('Local Transport', 'Daily transport service for sightseeing.', 100.00);


CREATE TABLE Booking_Addons (
  booking_id INTEGER,
  addon_id INTEGER,
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (addon_id) REFERENCES Addons(addon_id) ON DELETE CASCADE
);
INSERT INTO Booking_Addons (booking_id, addon_id)
VALUES 
(1, 1),
(2, 2);


CREATE TABLE Rates (
  rate_id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER,
  addon_id INTEGER,
  start_date DATE,
  end_date DATE,
  price DECIMAL,
  currency VARCHAR,
  rate_type TEXT CHECK(rate_type IN ('Regular', 'Discount', 'Seasonal')),
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (addon_id) REFERENCES Addons(addon_id) ON DELETE CASCADE
);
INSERT INTO Rates (room_id, addon_id, start_date, end_date, price, currency, rate_type)
VALUES 
(1, 1, '2025-01-01', '2025-02-01', 200.00, 'USD', 'Regular'),
(2, 2, '2025-01-15', '2025-01-20', 100.00, 'USD', 'Seasonal');


CREATE TABLE Taxes (
  tax_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR,
  percentage DECIMAL
);
INSERT INTO Taxes (name, percentage)
VALUES 
('Sales Tax', 8.00),
('City Tax', 5.00);


CREATE TABLE Payments (
  payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER,
  amount DECIMAL,
  currency VARCHAR,
  payment_method TEXT CHECK(payment_method IN ('Credit Card', 'Debit Card', 'Cash', 'Bank Transfer')),
  transaction_id VARCHAR,
  payment_date TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);
INSERT INTO Payments (booking_id, amount, currency, payment_method, transaction_id, payment_date)
VALUES 
(1, 200.00, 'USD', 'Credit Card', 'TRX123456', '2025-01-24 14:00:00'),
(2, 100.00, 'USD', 'Cash', NULL, '2025-01-23 10:00:00');


CREATE TABLE Invoices (
  invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER,
  invoice_date TIMESTAMP,
  due_date TIMESTAMP,
  total_amount DECIMAL,
  status TEXT CHECK(status IN ('Pending', 'Paid', 'Overdue')),
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);
INSERT INTO Invoices (booking_id, invoice_date, due_date, total_amount, status)
VALUES 
(1, '2025-01-24 12:00:00', '2025-01-25 12:00:00', 220.00, 'Paid'),
(2, '2025-01-23 09:00:00', '2025-01-24 09:00:00', 105.00, 'Pending');


CREATE TABLE Images (
  image_id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER,
  room_id INTEGER,
  image_url VARCHAR,
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);
INSERT INTO Images (hotel_id, room_id, image_url)
VALUES 
(1, 1, 'https://example.com/images/hotel1-room1.jpg'),
(2, 3, 'https://example.com/images/hotel2-room3.jpg');


CREATE TABLE Guest (
  guest_id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER,
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);
INSERT INTO Guest (booking_id, first_name, last_name, email, phone)
VALUES 
(1, 'John', 'Doe', 'john.doe@example.com', '+1234567890'),
(2, 'Jane', 'Smith', 'jane.smith@example.com', '+0987654321');


CREATE TABLE Contact (
  contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER,
  guest_id INTEGER,
  name VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES Guest(guest_id) ON DELETE CASCADE
);
INSERT INTO Contact (hotel_id, guest_id, name, phone, email)
VALUES 
(1, 1, 'Hotel Manager', '+1234567890', 'manager@hotel1.com'),
(2, 2, 'Reception', '+0987654321', 'reception@hotel2.com');


CREATE TABLE Promotions (
  promotion_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR,
  description TEXT,
  discount_type TEXT CHECK(discount_type IN ('Percentage', 'Amount')),
  discount_value DECIMAL,
  start_date DATE,
  end_date DATE
);
INSERT INTO Promotions (name, description, discount_type, discount_value, start_date, end_date)
VALUES 
('Winter Discount', 'Get 20% off on all bookings.', 'Percentage', 20.00, '2025-01-01', '2025-01-31'),
('Flat Rate Discount', 'Flat $50 off on suite rooms.', 'Amount', 50.00, '2025-01-15', '2025-02-01');


CREATE TABLE Booking_Promotions (
  booking_id INTEGER,
  promotion_id INTEGER,
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (promotion_id) REFERENCES Promotions(promotion_id) ON DELETE CASCADE
);
INSERT INTO Booking_Promotions (booking_id, promotion_id)
VALUES 
(1, 1),
(2, 2);


CREATE TABLE Reviews (
  review_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  booking_id INTEGER,
  hotel_id INTEGER,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);
INSERT INTO Reviews (user_id, booking_id, hotel_id, rating, review_text)
VALUES 
(1, 1, 1, 5, 'Fantastic stay with excellent amenities!'),
(2, 2, 2, 4, 'Great value for money.');


CREATE TABLE Policies (
  policy_id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER,
  policy_type TEXT CHECK(policy_type IN ('Cancellation', 'Pet', 'Smoking', 'Children')),
  description TEXT,
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);
INSERT INTO Policies (hotel_id, policy_type, description)
VALUES 
(1, 'Cancellation', 'Free cancellation within 24 hours.'),
(2, 'Pet', 'Pets are not allowed.');


CREATE TABLE Groups (
  group_id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_ids JSON,
  group_logo_URL VARCHAR,
  description TEXT
);
INSERT INTO Groups (hotel_ids, group_logo_URL, description)
VALUES 
('{"1": true, "2": true}', 'https://example.com/group-logo.jpg', 'Group of luxury hotels.');
