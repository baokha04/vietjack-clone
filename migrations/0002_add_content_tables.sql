-- Migration to add publisher, class, subject, book, and question tables

CREATE TABLE publisher (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unsignedName TEXT,
    description TEXT,
    deleted INTEGER DEFAULT 0
);

CREATE TABLE class (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unsignedName TEXT,
    description TEXT,
    deleted INTEGER DEFAULT 0,
    publisherId INTEGER,
    FOREIGN KEY (publisherId) REFERENCES publisher(id)
);

CREATE TABLE subject (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unsignedName TEXT,
    description TEXT,
    deleted INTEGER DEFAULT 0,
    classId INTEGER,
    FOREIGN KEY (classId) REFERENCES class(id)
);

CREATE TABLE book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unsignedName TEXT,
    description TEXT,
    deleted INTEGER DEFAULT 0,
    url TEXT,
    subjectId INTEGER,
    FOREIGN KEY (subjectId) REFERENCES subject(id)
);

CREATE TABLE question (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unsignedName TEXT,
    description TEXT,
    deleted INTEGER DEFAULT 0,
    answer TEXT,
    bookId INTEGER,
    FOREIGN KEY (bookId) REFERENCES book(id)
);
