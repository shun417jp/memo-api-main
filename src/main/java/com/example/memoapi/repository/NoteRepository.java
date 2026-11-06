package com.example.memoapi.repository;

import com.example.memoapi.dto.Note;
import com.example.memoapi.exception.NoteArgumentNotValidException;
import com.example.memoapi.exception.NoteNotFoundException;
import com.example.memoapi.mapper.NoteMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class NoteRepository {
    private final NoteMapper noteMapper;

    public NoteRepository(NoteMapper noteMapper) {
        this.noteMapper = noteMapper;
    }

    public List<Note> findAll() {
        return noteMapper.findAll();
    }

    public int insertNote(Note note){
        return noteMapper.insert(note);
    }

    public Note findById(long id){
        return noteMapper.findById(id);
    }

    public Note saveNote(Note note){
        if (note.getTitle() == null || note.getTitle().isEmpty()){
            throw new NoteNotFoundException("TItle is empty");
        }

        // content
        if (note.getContent() == null || note.getContent().isEmpty()){
            throw new NoteArgumentNotValidException("content is empty");
        }

        NoteRepository.insertNote(note){

        }
    }
}
