-- Migration filename: 0001_seed_data.sql

-- Seed Users
INSERT INTO Users (first_name, last_name, email, phone, password_hash) VALUES 
('John', 'Doe', 'john.doe@example.com', '+1234567890', 'hashed_password_1'),
('Jane', 'Smith', 'jane.smith@example.com', '+0987654321', 'hashed_password_2'),
('Bob', 'Johnson', 'bob.johnson@example.com', '+1122334455', 'hashed_password_3');

-- Seed HotelRooms
INSERT INTO HotelRooms (name, description, square_feet, base_price_per_night, rating, review_count) VALUES 
('Standard Room', 'A cozy room with all basic amenities', 300, 100.00, 4.0, 10),
('Deluxe Room', 'Spacious room with city view', 400, 150.00, 4.5, 15),
('Suite', 'Luxurious suite with ocean view', 600, 250.00, 5.0, 20);

-- Seed Hotels
INSERT INTO Hotels (name, address, city, state, country, star_rating, description, certification, amenities) VALUES 
('Seaside Resort', '123 Beach Road', 'Miami', 'FL', 'USA', 4.5, 'Beautiful beachfront resort', 
 '{"green_certified":true,"iso_certified":true}', 
 '{"pool":true,"spa":true,"gym":true,"restaurant":true}'),
('Mountain Lodge', '456 Peak View', 'Denver', 'CO', 'USA', 4.0, 'Cozy mountain retreat',
 '{"eco_friendly":true}', 
 '{"hiking_trails":true,"ski_storage":true,"fireplace":true}');

-- Seed Rooms
INSERT INTO Rooms (hotel_id, room_type, capacity, max_capacity, max_adults, max_children, checkin_time, checkout_time, price) VALUES 
(1, 'Deluxe', 2, 4, 2, 2, '15:00', '11:00', 200.00),
(1, 'Suite', 4, 6, 4, 2, '15:00', '11:00', 350.00),
(2, 'Single', 1, 2, 1, 1, '14:00', '10:00', 100.00);

-- Seed Addons
INSERT INTO Addons (name, description, price) VALUES 
('Airport Transfer', 'Round-trip airport transfer service', 50.00),
('Breakfast Package', 'Daily breakfast buffet', 25.00),
('Spa Package', 'Full day spa access', 75.00);

-- Seed Taxes
INSERT INTO Taxes (name, percentage) VALUES 
('Room Tax', 10.00),
('Tourism Tax', 5.00),
('City Tax', 2.50);

-- Seed Promotions
INSERT INTO Promotions (name, description, discount_type, discount_value, start_date, end_date) VALUES 
('Early Bird', 'Book 60 days in advance for 20% off', 'Percentage', 20.00, '2024-01-01', '2024-12-31'),
('Summer Special', 'Get $50 off on minimum 3 nights stay', 'Amount', 50.00, '2024-06-01', '2024-08-31');

-- Seed Policies
INSERT INTO Policies (hotel_id, policy_type, description) VALUES 
(1, 'Cancellation', 'Free cancellation up to 24 hours before check-in'),
(1, 'Pet', 'Pets allowed with additional $50 cleaning fee'),
(2, 'Smoking', 'No smoking allowed in any room or indoor area'),
(2, 'Children', 'Children under 12 stay free with parents');

-- Seed sample booking flow
-- First booking
INSERT INTO Bookings (user_id, hotel_id, room_id, hotel_room_id, booking_type, booking_source, 
                     start_date, end_date, date_flexibility, total_price, status) VALUES 
(1, 1, 1, 1, 'Night', '{"channel": "website", "device": "desktop"}', 
 '2024-03-15', '2024-03-18', 0, 650.00, 'Confirmed');

INSERT INTO Guest (booking_id, first_name, last_name, email, phone) VALUES 
(1, 'John', 'Doe', 'john.doe@example.com', '+1234567890');

INSERT INTO Payments (booking_id, amount, currency, payment_method, transaction_id, payment_date) VALUES 
(1, 650.00, 'USD', 'Credit Card', 'TXN123456', unixepoch());

INSERT INTO Booking_Addons (booking_id, addon_id) VALUES 
(1, 1),
(1, 2);

-- Second booking
INSERT INTO Bookings (user_id, hotel_id, room_id, hotel_room_id, booking_type, booking_source, 
                     start_date, end_date, date_flexibility, total_price, status) VALUES 
(2, 2, 3, 2, 'Night', '{"channel": "mobile_app", "device": "ios"}', 
 '2024-04-01', '2024-04-03', 1, 225.00, 'Pending');

INSERT INTO Guest (booking_id, first_name, last_name, email, phone) VALUES 
(2, 'Jane', 'Smith', 'jane.smith@example.com', '+0987654321');

-- Seed Reviews
INSERT INTO Reviews (user_id, booking_id, hotel_id, rating, review_text) VALUES 
(1, 1, 1, 5, 'Excellent stay! The room was clean and the staff was very friendly.'),
(2, 2, 2, 4, 'Great location and comfortable rooms. Could improve breakfast options.');

-- Seed Images
INSERT INTO Images (hotel_id, room_id, image_url) VALUES 
(1, 1, 'https://example.com/hotels/1/rooms/1/image1.jpg'),
(1, 2, 'https://example.com/hotels/1/rooms/2/image1.jpg'),
(2, 3, 'https://example.com/hotels/2/rooms/3/image1.jpg');

-- Seed Groups
INSERT INTO Groups (hotel_ids, group_logo_URL, description) VALUES 
('{"1":true,"2":true}', 'https://example.com/hotel-group-logo.jpg', 'Premium Hotel Collection Group');

-- Seed Availability for next 30 days
INSERT INTO Availability (room_id, date, available) 
SELECT 
  r.room_id,
  date('now', '+' || i || ' days'),
  1
FROM Rooms r
CROSS JOIN (SELECT value as i FROM json_each('[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29]'))
WHERE r.room_id IN (1, 2, 3);

-- Seed Inventory
INSERT INTO Inventory (room_id, date, availability) 
SELECT 
  r.room_id,
  date('now', '+' || i || ' days'),
  '{"available": true, "total_rooms": 5, "booked_rooms": 0}'
FROM Rooms r
CROSS JOIN (SELECT value as i FROM json_each('[0,1,2,3,4,5,6,7,8,9,10]'))
WHERE r.room_id IN (1, 2, 3);