package com.example.memoapi.exception;

public class NoteArgumentNotValidException extends RuntimeException {
    public NoteArgumentNotValidException(String message) {
        super(message);
    }
}
