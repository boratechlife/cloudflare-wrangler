-- Migration filename: 0000_initial_schema.sql

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create Users table
CREATE TABLE Users (
  user_id INTEGER PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  password_hash TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Create HotelRooms table
CREATE TABLE HotelRooms (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  square_feet INTEGER,
  base_price_per_night REAL NOT NULL,
  rating REAL CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Create Hotels table
CREATE TABLE Hotels (
  hotel_id INTEGER PRIMARY KEY,
  name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  star_rating REAL,
  description TEXT,
  certification TEXT, -- JSON stored as TEXT
  amenities TEXT,    -- JSON stored as TEXT
  created_at INTEGER DEFAULT (unixepoch())
);

-- Create Rooms table
CREATE TABLE Rooms (
  room_id INTEGER PRIMARY KEY,
  hotel_id INTEGER,
  room_type TEXT CHECK(room_type IN ('Single', 'Double', 'Deluxe', 'Suite')),
  capacity INTEGER,
  max_capacity INTEGER,
  max_adults INTEGER,
  max_children INTEGER,
  checkin_time TEXT,
  checkout_time TEXT,
  price REAL,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);

-- Create Bookings table
CREATE TABLE Bookings (
  booking_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  hotel_id INTEGER,
  room_id INTEGER,
  hotel_room_id INTEGER,
  booking_type TEXT CHECK(booking_type IN ('Day', 'Night', 'Hourly')),
  booking_source TEXT, -- JSON stored as TEXT
  start_date TEXT,     -- Store as ISO8601 string
  end_date TEXT,       -- Store as ISO8601 string
  date_flexibility INTEGER, -- Boolean as INTEGER
  earliest_date TEXT,  -- Store as ISO8601 string
  latest_date TEXT,    -- Store as ISO8601 string
  total_price REAL,
  selected_rooms TEXT, -- JSON stored as TEXT
  total_amount DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  addon_ids TEXT,      -- JSON stored as TEXT
  status TEXT CHECK(status IN ('Pending', 'Confirmed', 'Cancelled')),
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_room_id) REFERENCES HotelRooms(id) ON DELETE CASCADE
);

-- Create Inventory table
CREATE TABLE Inventory (
  inventory_id INTEGER PRIMARY KEY,
  room_id INTEGER,
  date TEXT,           -- Store as ISO8601 string
  availability TEXT,   -- JSON stored as TEXT
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

-- Create Booking_Inventory junction table
CREATE TABLE Booking_Inventory (
  booking_id INTEGER,
  inventory_id INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (booking_id, inventory_id),
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_id) REFERENCES Inventory(inventory_id) ON DELETE CASCADE
);

-- Create Availability table
CREATE TABLE Availability (
  room_id INTEGER,
  date TEXT,           -- Store as ISO8601 string
  available INTEGER,   -- Boolean as INTEGER
  created_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (room_id, date),
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

-- Create Addons table
CREATE TABLE Addons (
  addon_id INTEGER PRIMARY KEY,
  name TEXT,
  description TEXT,
  price REAL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Create Booking_Addons junction table
CREATE TABLE Booking_Addons (
  booking_id INTEGER,
  addon_id INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (booking_id, addon_id),
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (addon_id) REFERENCES Addons(addon_id) ON DELETE CASCADE
);

-- Create Rates table
CREATE TABLE Rates (
  rate_id INTEGER PRIMARY KEY,
  room_id INTEGER,
  addon_id INTEGER,
  start_date TEXT,     -- Store as ISO8601 string
  end_date TEXT,       -- Store as ISO8601 string
  price REAL,
  currency TEXT,
  rate_type TEXT CHECK(rate_type IN ('Regular', 'Discount', 'Seasonal')),
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (addon_id) REFERENCES Addons(addon_id) ON DELETE CASCADE
);

-- Create Taxes table
CREATE TABLE Taxes (
  tax_id INTEGER PRIMARY KEY,
  name TEXT,
  percentage REAL,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Create Payments table
CREATE TABLE Payments (
  payment_id INTEGER PRIMARY KEY,
  booking_id INTEGER,
  amount REAL,
  currency TEXT,
  payment_method TEXT CHECK(payment_method IN ('Credit Card', 'Debit Card', 'Cash', 'Bank Transfer')),
  transaction_id TEXT,
  payment_date INTEGER, -- Store as unixepoch
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);

-- Create Invoices table
CREATE TABLE Invoices (
  invoice_id INTEGER PRIMARY KEY,
  booking_id INTEGER,
  invoice_date INTEGER, -- Store as unixepoch
  due_date INTEGER,    -- Store as unixepoch
  total_amount REAL,
  status TEXT CHECK(status IN ('Pending', 'Paid', 'Overdue')),
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);

-- Create Images table
CREATE TABLE Images (
  image_id INTEGER PRIMARY KEY,
  hotel_id INTEGER,
  room_id INTEGER,
  image_url TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

-- Create Guest table
CREATE TABLE Guest (
  guest_id INTEGER PRIMARY KEY,
  booking_id INTEGER,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE
);

-- Create Contact table
CREATE TABLE Contact (
  contact_id INTEGER PRIMARY KEY,
  hotel_id INTEGER,
  guest_id INTEGER,
  name TEXT,
  phone TEXT,
  email TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES Guest(guest_id) ON DELETE CASCADE
);

-- Create Promotions table
CREATE TABLE Promotions (
  promotion_id INTEGER PRIMARY KEY,
  name TEXT,
  description TEXT,
  discount_type TEXT CHECK(discount_type IN ('Percentage', 'Amount')),
  discount_value REAL,
  start_date TEXT,     -- Store as ISO8601 string
  end_date TEXT,       -- Store as ISO8601 string
  created_at INTEGER DEFAULT (unixepoch())
);

-- Create Booking_Promotions junction table
CREATE TABLE Booking_Promotions (
  booking_id INTEGER,
  promotion_id INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (booking_id, promotion_id),
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (promotion_id) REFERENCES Promotions(promotion_id) ON DELETE CASCADE
);

-- Create Reviews table
CREATE TABLE Reviews (
  review_id INTEGER PRIMARY KEY,
  user_id INTEGER,
  booking_id INTEGER,
  hotel_id INTEGER,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);

-- Create Policies table
CREATE TABLE Policies (
  policy_id INTEGER PRIMARY KEY,
  hotel_id INTEGER,
  policy_type TEXT CHECK(policy_type IN ('Cancellation', 'Pet', 'Smoking', 'Children')),
  description TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (hotel_id) REFERENCES Hotels(hotel_id) ON DELETE CASCADE
);

-- Create Groups table
CREATE TABLE Groups (
  group_id INTEGER PRIMARY KEY,
  hotel_ids TEXT,      -- JSON stored as TEXT
  group_logo_URL TEXT,
  description TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);