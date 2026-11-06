package com.example.memoapi.service;

import com.example.memoapi.dto.Note;
import com.example.memoapi.exception.NoteNotFoundException;
import com.example.memoapi.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {
    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    public List<Note> findAll() {
        return noteRepository.findAll();
    }

    public Note saveNote(Note note){
        noteRepository.insertNote(note);
        return note;
    }

    public Note findById(long id){
        Note note = noteRepository.findById(id);

        if (note == null){
            throw new NoteNotFoundException(id);
        }

        return note;
    }
}
